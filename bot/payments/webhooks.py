import base64

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from bot.config import settings
from bot.models import Order, OrderStatus
from bot.payments.click import (
    ERROR_ALREADY_PAID,
    ERROR_ORDER_NOT_FOUND,
    ERROR_SIGN_CHECK_FAILED,
    ERROR_SUCCESS,
    click_provider,
)
from bot.payments.payme import PaymeError, payme_provider
from bot.services.db import async_session

router = APIRouter()


@router.post("/payments/click")
async def click_webhook(request: Request) -> JSONResponse:
    """Click.uz merchant callback — see PAYMENTS_GUIDE.md.

    Click POSTs form-encoded data twice per payment: once with action=0
    (Prepare, reserve the order) and once with action=1 (Complete, confirm
    the charge actually went through).
    """
    form = await request.form()
    data = dict(form)
    action = data.get("action")

    async with async_session() as session:
        order_id_str = data.get("merchant_trans_id", "")
        order = await session.get(Order, int(order_id_str)) if order_id_str.isdigit() else None

        base_response = {
            "click_trans_id": data.get("click_trans_id"),
            "merchant_trans_id": order_id_str,
        }

        if order is None:
            return JSONResponse(
                {**base_response, "error": ERROR_ORDER_NOT_FOUND, "error_note": "Order not found"}
            )

        if action == "0":
            if not click_provider.verify_prepare_signature(data):
                return JSONResponse(
                    {
                        **base_response,
                        "error": ERROR_SIGN_CHECK_FAILED,
                        "error_note": "Sign check failed",
                    }
                )
            return JSONResponse(
                {
                    **base_response,
                    "merchant_prepare_id": order.id,
                    "error": ERROR_SUCCESS,
                    "error_note": "Success",
                }
            )

        if action == "1":
            if not click_provider.verify_complete_signature(data):
                return JSONResponse(
                    {
                        **base_response,
                        "error": ERROR_SIGN_CHECK_FAILED,
                        "error_note": "Sign check failed",
                    }
                )
            if order.status == OrderStatus.COMPLETED:
                return JSONResponse(
                    {**base_response, "error": ERROR_ALREADY_PAID, "error_note": "Already paid"}
                )

            order.status = OrderStatus.COMPLETED
            await session.commit()
            return JSONResponse(
                {
                    **base_response,
                    "merchant_confirm_id": order.id,
                    "error": ERROR_SUCCESS,
                    "error_note": "Success",
                }
            )

    return JSONResponse({**base_response, "error": -3, "error_note": "Action not found"})


@router.post("/payments/payme")
async def payme_webhook(request: Request) -> JSONResponse:
    """Payme merchant callback (JSON-RPC 2.0) — see PAYMENTS_GUIDE.md."""
    expected_auth = (
        "Basic " + base64.b64encode(f"Paycom:{settings.payme_secret_key}".encode()).decode()
    )
    if request.headers.get("Authorization") != expected_auth:
        return JSONResponse(
            {"error": {"code": -32504, "message": "Insufficient privilege to perform this method"}}
        )

    body = await request.json()
    method = body.get("method")
    params = body.get("params", {})
    request_id = body.get("id")

    async with async_session() as session:
        try:
            result = await payme_provider.dispatch(session, method, params)
            return JSONResponse({"jsonrpc": "2.0", "id": request_id, "result": result})
        except PaymeError as exc:
            return JSONResponse(
                {
                    "jsonrpc": "2.0",
                    "id": request_id,
                    "error": {"code": exc.code, "message": exc.message},
                }
            )
