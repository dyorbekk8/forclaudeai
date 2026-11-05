import json, re
# EP06 "What If You Grew 1% Every Time Someone Lied to You?"
L = [
# A hook
("a01","MIA","[sweetly] I love your haircut, Leo."),
("a02","N","Your head hits the ceiling."),
("a03","N","[curious] Because starting today... every time someone lies to you, you grow one percent taller."),
("a04","N","And your little sister... absolutely hates that haircut."),
# B rule + math
("b01","N","Here's the rule. Every lie told to your face, or sent to you, makes you one percent taller. And every hard truth... makes you one percent shorter."),
("b02","N","You're a hundred and sixty centimeters. The shortest kid in your class."),
("b03","N","Scientists think the average person tells about one and a half lies a day. Most of them small. Nice shirt. I'm almost there. I'm fine."),
("b04","N","But one percent stacks. Fifty three lies, and you're taller than the tallest man who ever lived."),
("b05","N","Eight hundred sixty six lies... and you're taller than Mount Everest."),
# C day 1
("c01","N","Day one. Your friend says he's five minutes away. He's still at home. Plus one percent."),
("c02","N","Your teacher says the test will be easy. Plus one percent."),
("c03","N","By lunch, you're two meters tall. You duck under every door frame. And for the first time in your life... people look up at you."),
("c04","N","[smug] So you get smart. You start asking questions that people always lie about."),
("c05","KID","[nervous] Your drawing? Uh... it's amazing, man. Really."),
("c06","N","Plus one. Do I look tired? No! Plus one. Is my singing good? Plus one. Plus one. Plus one."),
("c07","N","By Friday, you're two meters seventy. Taller than Robert Wadlow, the tallest man in recorded history."),
("c08","N","[amused] You dunk a basketball without jumping. Everyone suddenly laughs at your jokes. Even the terrible ones. Plus one. Plus one. Plus one."),
# D viral
("d01","N","Then the internet finds out."),
("d02","N","[building] Millions of strangers start sending you lies on purpose. Just to watch you grow. You're the most handsome person alive. You have two hundred I Q. You can fly."),
("d03","N","Plus one percent. Plus one percent. Plus one percent. Faster than you can read them."),
("d04","N","By morning, you're as tall as a giraffe. By noon, you can't fit in your house."),
("d05","N","[tense] You sleep in the park. Your feet are three streets away from your head."),
("d06","N","Day three. Ninety three meters. As tall as the Statue of Liberty. Every step you take sets off car alarms for a mile."),
("d06b","N","A news helicopter circles your head. The reporter shouts into a megaphone. You look fantastic! Plus one percent."),
# E higher
("e01","N","Day five. Nine hundred meters. You're looking down at the top of the tallest building on Earth."),
("e02","N","And up here, it's freezing. The air is thin. Clouds drift past your chest."),
("e02b","N","[awed] A passenger jet glides past your ear. The pilot waves. You wave back. Very, very slowly."),
("e03","N","Day seven. Nine kilometers. Higher than Mount Everest. Above eight thousand meters, climbers call it the death zone. There isn't enough oxygen to stay alive for long."),
("e04","N","[breathless] Your head is spinning. Your lips are blue. And the lies just keep coming."),
("e05","N","You realize something terrible. If this keeps going... you'll grow until your head is in space."),
# F truth
("f01","N","There's only one way down. Someone has to tell you the truth."),
("f02","N","[frustrated] But nobody does. Your doctors say you'll be fine. The news says help is on the way. Even your mom says, don't worry, sweetheart. Everything's okay."),
("f03","N","Plus one. Plus one. Plus one. Everyone you love is lying to you... to make you feel better."),
("f04","N","[quietly] And then a tiny voice comes through the phone in your ear."),
("f05","MIA","[serious] Leo. It's Mia. I'm going to tell you the truth. All of it."),
("f06","MIA","[shaky] You've been a bad brother since you got tall. You stopped coming to my games. You only talk to people who lie to you."),
("f07","N","Minus one percent. Minus one percent. It hurts more than the cold."),
("f08","MIA","[crying] And I hate your haircut. I always did. And I don't care how tall you are. I just want my brother back."),
("f08b","MOM","[crying] And Leo... I'm scared. I've been scared every single day. I'm sorry I lied to you."),
("f08c","N","Minus one percent. Your mom's truth hits harder than anything."),
("f09","N","[emotional] Every truth pulls you closer to the ground. Clouds. Rooftops. Trees."),
("f10","N","For a whole night, she doesn't lie to you once. Not even to be nice."),
# G ending
("g01","N","When the sun comes up, you're a hundred and sixty centimeters again. Shortest kid in the class."),
("g02","N","And for the first time, you understand. The people who tell you nice lies are the ones who want you to feel good."),
("g03","N","[softly] The ones who tell you the truth... are the ones who want you to stay."),
("g04","MIA","[smiling] Also, I didn't eat your last cookie."),
("g05","N","[pause] Plus one percent."),
("g06","N","Who in your life always tells you the truth? Tag them in the comments."),
]
PAUSE = {"a01":0.2,"a02":0.6,"a03":0.5,"a04":1.1,"b01":0.5,"b02":0.5,"b03":0.5,"b04":0.6,"b05":1.0,
 "c01":0.4,"c02":0.4,"c03":0.5,"c04":0.3,"c05":0.3,"c06":0.5,"c07":0.6,"c08":1.0,"d01":0.6,"d02":0.3,"d03":0.5,"d04":0.5,"d05":0.6,"d06":0.5,"d06b":1.0,
 "e01":0.5,"e02":0.4,"e02b":0.9,"e03":0.6,"e04":0.6,"e05":1.2,"f01":0.8,"f02":0.4,"f03":0.8,"f04":0.6,"f05":0.6,"f06":0.6,"f07":0.6,"f08":0.6,"f08b":0.6,"f08c":0.8,"f09":0.6,"f10":1.2,
 "g01":0.6,"g02":0.5,"g03":1.0,"g04":0.6,"g05":1.0}
lines = []
for i, s, el in L:
    t = re.sub(r"\[[^\]]*\]\s*", "", el).strip()
    lines.append({"id": i, "s": s, "t": t, "el": el, "p": PAUSE.get(i, 0.32)})
cast = {"N": {"voice": "am_michael", "speed": 0.95}, "MOM": {"voice": "af_heart", "speed": 1.0}, "MIA": {"voice": "af_heart", "speed": 1.0}, "KID": {"voice": "am_puck", "speed": 1.05}}
json.dump({"title": "What If You Grew 1% Every Time Someone Lied to You?", "cast": cast, "lines": lines}, open("lines.json", "w"), indent=1)
w = sum(len(l["t"].split()) for l in lines)
print(len(lines), "lines", w, "words ~", round(w / 145, 1), "min")
