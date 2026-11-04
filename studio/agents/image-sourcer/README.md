# image-sourcer agent

Finds high-quality, topic-matched photos that are **legal to use** on YouTube:
U.S. government works (public domain) and Wikimedia Commons free licenses (CC BY / CC BY-SA, credited).
No Google Images / Pinterest scraping (copyright-strike risk).

Per project: `<project>/tools/picks.json` (needs → Commons titles), `img/` (1280px downloads),
`credits.json` (author, license, source page), `contact_sheet.jpg` (review sheet).
Downloads: `python3 -I tools/dl_direct.py tools/picks.json` (upload.wikimedia.org, contact UA, paced).
The supervisor copies approved images to `07_render/public/photos/<project>/` and credits them on screen + in the description.
