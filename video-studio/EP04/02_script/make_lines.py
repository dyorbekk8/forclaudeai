import json, re
# EP04 "What If You Got 1% Faster Every Time Someone Said Your Name?"
L = [
# A hook
("a01","MOM","[shouting from downstairs] Leo! Breakfast!"),
("a02","N","You blink. And you're already downstairs."),
("a03","N","Your toast is still in the air. Your mom hasn't even finished saying your name."),
("a04","N","Because starting today... every time someone says your name, you get one percent faster."),
("a05","N","[ominous] And one percent... adds up."),
# B rule + math
("b01","N","Here's the rule. Every time anyone, anywhere, says your name out loud, your speed goes up by one percent. And every hour nobody says it... you lose one percent."),
("b02","N","Your top speed right now? Twenty four kilometers an hour. A normal fifteen year old."),
("b03","N","But percentages stack. Sixty two times, and you're as fast as Usain Bolt."),
("b04","N","Three hundred ninety six times. You break the speed of sound."),
("b05","N","And seventeen hundred seventy one times... you're running at the speed of light."),
("b06","N","[pause] That's fewer people than go to some schools."),
# C day 1
("c01","N","Day one. The problem is... nobody really says your name."),
("c02","N","You're the quiet kid. Back row. Headphones. On a good day, your name gets said maybe three times."),
("c03","TEACH","[bored] Leo? ...Leo. Present?"),
("c04","N","Plus one. Plus one."),
("c05","N","So you get creative. A name tag. A loud hello to everyone in the hallway. You even join the basketball team, just so the coach yells at you."),
("c06","COACH","[yelling] LEO! Pass the ball! LEO!"),
("c07","N","By Friday, you run the forty meter dash in three seconds flat. The coach drops his stopwatch."),
("c08","N","Day two. You start having fun. You catch your phone before it hits the floor. You finish your homework before the teacher finishes the question. You bring your mom the lunch she forgot at home... and you are back before your cereal gets soggy."),
# D viral
("d01","N","Then someone films you outrunning the school bus."),
("d02","N","[building] By morning, it has eleven million views. And every comment, every reaction video, every person telling their friend about you... says your name."),
("d03","KID","[excited] Dude, did you see Leo?! Leo is insane!"),
("d04","N","Plus one percent. Plus one percent. Plus one percent. Faster than you can count."),
("d04b","N","Mach one. Mach two. Your sneakers melt on the pavement. You go through three pairs a day."),
("d05","N","[tense] At lunch, you stand up too fast. And the air around you cracks like thunder."),
("d06","N","A sonic boom. Every window in the cafeteria explodes at once."),
("d07","N","Nobody's hurt. But for the first time... people are scared of you."),
# E escape velocity / relativity
("e01","N","Day four. Forty thousand kilometers an hour. Escape velocity. If you jumped right now, you would leave the Earth."),
("e02","N","You learn to move slowly. Painfully slowly. Every step has to be gentle, or you'll go through a wall."),
("e02b","N","[amazed] At this speed, the world looks frozen. Raindrops hang in the air like glass beads. You walk between them... and stay completely dry."),
("e03","N","And then something strange starts happening. To time."),
("e04","N","Einstein figured this out over a hundred years ago. The faster you move, the slower your clock ticks compared to everyone else."),
("e05","N","At ninety nine point nine nine percent of light speed, one day for you... is seventy days for them."),
("e06","N","[quietly] You run to the store to buy milk. When you get home, it's two months later."),
("e07","MOM","[crying, relieved] Leo? Leo! Where have you been?!"),
("e08","N","Every time she says it, you get faster. And every time you get faster... you lose her a little more."),
# F the choice
("f01","N","You do the math. If this keeps going, one afternoon for you will be ten years for your family. Your little sister Mia will grow up while you blink."),
("f02","N","[serious] There's only one way to slow down."),
("f03","N","The world has to forget your name."),
("f04","N","So you disappear. You delete everything. You ask everyone to stop talking about you. You stop going to school."),
("f05","N","And slowly... the world moves on. The videos stop. The memes die. Nobody says Leo anymore."),
("f05b","MOM","[on TV, pleading] Please. If you love my son... stop saying his name."),
("f06","N","Minus one percent. Minus one percent. Every hour."),
("f07","N","Light speed. Then rocket speed. Then a car. Then... just you. Normal. For one perfect afternoon, you're exactly as fast as everyone else."),
# G the freeze
("g01","N","[ominous] But the rule doesn't stop at normal."),
("g02","N","After a week of silence, you're moving at one fifth speed. Your hand takes ten seconds to reach a glass of water."),
("g02b","N","Mia sits next to you and talks for hours. To you, her voice sounds like a recording played at the wrong speed."),
("g03","N","After a month... you're a statue. To you, it feels like a slow blink. To everyone else, you haven't moved in days."),
("g04","N","[whispers] You can hear the house around you. You just can't move."),
("g05","N","Your mom stops saying your name. Not because she forgot. Because it hurts too much."),
# H Mia
("h01","N","And then, one night... the door opens. It's Mia. She sits on the edge of your bed, the way she used to when she had nightmares."),
("h02","MIA","[softly] Leo."),
("h03","N","Plus one percent. Your finger twitches."),
("h04","MIA","[tearful] Leo. Leo. Leo!"),
("h05","N","[emotional] She doesn't stop. She says it a hundred times. Then she comes back the next morning and says it again. And again. Every single day."),
("h06","N","Not millions of strangers. Just one little girl who refuses to let you disappear."),
("h07","N","And for the first time, you understand. Your name was never about speed. It was about being remembered."),
("h08","MIA","[smiling] Morning, Leo."),
# I cliffhanger
("i01","N","A year later, you're normal again. Mia says your name every morning. Exactly one hundred times. No more, no less."),
("i02","N","[pause] And then, your phone buzzes."),
("i03","N","Someone found the old video. It's trending again. Number one. Worldwide."),
("i04","N","[whispers] And you feel your heartbeat... speeding up."),
("i05","N","Would you want this power? And who would say your name every day? Tell me in the comments."),
]
PAUSE = {"a01":0.25,"a02":0.35,"a03":0.4,"a04":0.6,"a05":1.1,"b01":0.5,"b02":0.5,"b03":0.5,"b04":0.6,"b05":0.8,"b06":1.1,
 "c01":0.4,"c02":0.4,"c03":0.25,"c04":0.5,"c05":0.3,"c06":0.3,"c07":0.6,"c08":1.0,"d01":0.5,"d02":0.3,"d03":0.3,"d04":0.4,"d04b":0.6,"d05":0.3,"d06":0.8,"d07":1.2,
 "e01":0.6,"e02":0.5,"e02b":1.0,"e03":0.8,"e04":0.5,"e05":0.7,"e06":0.6,"e07":0.5,"e08":1.3,"f01":0.6,"f02":0.6,"f03":1.2,"f04":0.5,"f05":0.5,"f05b":0.8,"f06":0.5,"f07":1.2,
 "g01":0.8,"g02":0.5,"g02b":0.8,"g03":0.7,"g04":0.9,"g05":1.4,"h01":0.8,"h02":0.9,"h03":0.7,"h04":0.6,"h05":0.6,"h06":0.7,"h07":0.9,"h08":1.5,
 "i01":0.6,"i02":0.6,"i03":0.6,"i04":1.0}
lines = []
for i, s, el in L:
    t = re.sub(r"\[[^\]]*\]\s*", "", el).strip()
    lines.append({"id": i, "s": s, "t": t, "el": el, "p": PAUSE.get(i, 0.32)})
cast = {"N": {"voice": "am_michael", "speed": 0.95}, "MOM": {"voice": "af_heart", "speed": 1.0}, "MIA": {"voice": "af_heart", "speed": 1.0},
        "TEACH": {"voice": "bm_george", "speed": 0.95}, "COACH": {"voice": "am_onyx", "speed": 1.0}, "KID": {"voice": "am_puck", "speed": 1.05}}
json.dump({"title": "What If You Got 1% Faster Every Time Someone Said Your Name?", "cast": cast, "lines": lines}, open("lines.json", "w"), indent=1)
w = sum(len(l["t"].split()) for l in lines)
print(len(lines), "lines", w, "words ~", round(w / 145, 1), "min")
