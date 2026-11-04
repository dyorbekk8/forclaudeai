import json, re
# EP05 "What If Every Blink Teleported You 10x Farther?"
L = [
# A hook
("a01","N","You wake up. You open your eyes. You blink."),
("a02","N","And you're one meter closer to the door."),
("a03","N","[curious] Weird. You blink again. Ten meters. You're standing in the kitchen."),
("a04","MOM","[surprised] Leo?! How did you... Don't forget your..."),
("a05","N","[tense] Blink. And you never hear the end of that sentence."),
# B rule
("b01","N","Here's the rule. Every time you blink, you teleport forward, in whatever direction you're looking. And every blink sends you ten times farther than the last one."),
("b02","N","One meter. Ten. A hundred. A thousand."),
("b03","N","The average person blinks about fifteen times a minute. Which means..."),
("b04","N","[ominous] In less than two minutes, you'll be outside the observable universe."),
("b05","N","There are only two small mercies. You can't teleport into anything solid. And if you keep your eyes closed for ten full seconds, the count resets back to one meter."),
("b06","N","[urgent] But right now... you don't know any of that."),
# C on Earth
("c01","N","Blink three. A hundred meters. You land in the middle of the street. A car horn screams past your face."),
("c02","N","[panicked] Blink four. One kilometer. You're on the roof of your school. Your science teacher is drinking coffee. She drops it."),
("c03","N","Your eyes are burning. You try not to blink. Five seconds. Ten. Fifteen. Tears run down your face."),
("c04","N","[defeated] And then... you look up at the sky. And you blink."),
# D up
("d01","N","Ten kilometers. You're at the height of a passenger jet. A kid in a window seat stares at you. You stare back."),
("d02","N","[breathless] Somehow, the teleport drags a bubble of air along with you. Don't ask how. Just breathe."),
("d03","N","Blink six. A hundred kilometers. The Karman line. Officially... you are in space."),
("d04","N","Below you, the whole sky is black. And the curve of the Earth glows blue, like the edge of a marble."),
("d05","N","Blink seven. A thousand kilometers. You pass the International Space Station. Somebody inside drops a sandwich."),
("d06","N","Blink eight. Ten thousand kilometers. For the first time, you can see the entire planet. Every person you have ever met is down there."),
# E solar system
("e01","N","[building] Blink nine. Blink ten. A million kilometers. The Moon whips past you. It's already behind you."),
("e02","N","Blink eleven. Ten million. Blink twelve. A hundred million kilometers. The Sun is shrinking behind you."),
("e03","N","Blink thirteen. A billion kilometers. Saturn. Its rings are so wide, they'd stretch most of the way from Earth to the Moon."),
("e04","N","Blink fifteen. A hundred billion kilometers. A little probe called Voyager has been flying away from Earth for almost fifty years. You just passed it. In a blink."),
("e05","N","[quietly] You turn around. Earth is a single pale blue pixel. And then it's gone."),
# F stars and galaxies
("f01","N","Blink seventeen. One light year. Light itself needs a whole year to get here. You needed one quarter of a second."),
("f02","N","Blink eighteen. Ten light years. You fly straight past Proxima Centauri, the closest star to the Sun."),
("f03","N","Blink twenty two. A hundred thousand light years. You are outside the Milky Way. All two hundred billion of its stars... fit in your view."),
("f04","N","Blink twenty four. Ten million light years. Andromeda is behind you. A trillion stars."),
("f05","N","Blink twenty six. A billion light years. Galaxies stretch out in long glowing threads. Like a spider web made of light."),
("f06","N","[awed] Blink twenty seven. Ten billion light years. Almost everything that exists... is behind you."),
# G edge
("g01","N","[whispers] Your eyes are burning again. You know what happens if you blink."),
("g02","N","The observable universe is about forty six billion light years in every direction. Your next blink is a hundred billion."),
("g03","N","[very tense] Ten seconds. Twenty. Thirty. Your whole body shakes."),
("g04","N","And then you remember something. You close your eyes. And you keep them closed."),
("g05","N","One. Two. Three. Four. Five. Six. Seven. Eight. Nine. Ten."),
("g06","N","[softly] Reset. One meter."),
# H ending
("h01","N","You open your eyes. You are a hundred billion light years from home. And from now on, every step back is only one meter long."),
("h02","N","[emotional] And the only thing you can think about is your mom, standing in the kitchen. Trying to tell you something."),
("h03","MOM","[echo, soft] Don't forget your..."),
("h04","N","How would you get home? Tell me in the comments. Because next time... you're going to try."),
]
PAUSE = {"a01":0.4,"a02":0.6,"a03":0.4,"a04":0.2,"a05":1.1,"b01":0.5,"b02":0.5,"b03":0.3,"b04":1.0,"b05":0.5,"b06":1.0,
 "c01":0.5,"c02":0.5,"c03":0.6,"c04":1.0,"d01":0.6,"d02":0.6,"d03":0.6,"d04":0.8,"d05":0.6,"d06":1.0,
 "e01":0.5,"e02":0.5,"e03":0.6,"e04":0.7,"e05":1.2,"f01":0.6,"f02":0.6,"f03":0.7,"f04":0.6,"f05":0.7,"f06":1.2,
 "g01":0.6,"g02":0.6,"g03":0.6,"g04":0.6,"g05":0.4,"g06":1.4,"h01":0.8,"h02":0.8,"h03":1.4}
lines = []
for i, s, el in L:
    t = re.sub(r"\[[^\]]*\]\s*", "", el).strip()
    lines.append({"id": i, "s": s, "t": t, "el": el, "p": PAUSE.get(i, 0.32)})
cast = {"N": {"voice": "am_michael", "speed": 0.95}, "MOM": {"voice": "af_heart", "speed": 1.0}}
json.dump({"title": "What If Every Blink Teleported You 10x Farther?", "cast": cast, "lines": lines}, open("lines.json", "w"), indent=1)
w = sum(len(l["t"].split()) for l in lines)
print(len(lines), "lines", w, "words ~", round(w / 145, 1), "min")
