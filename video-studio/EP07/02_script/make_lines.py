import json, re
# EP07 "What If You Got 1% Smarter Every Time Someone Called You Stupid?"
L = [
("a01","KID","[mocking] Leo, you're so stupid."),
("a02","N","And suddenly... you understand calculus."),
("a03","N","[curious] Because starting today, every time someone calls you stupid, you get one percent smarter."),
("a04","N","[ominous] And people call you stupid... a lot."),
("b01","N","Here's the rule. Every time anyone calls you stupid, dumb, or an idiot, your I Q goes up one percent. And every time someone calls you smart... it drops one percent."),
("b02","N","Your I Q right now is a hundred. Perfectly average. You got a C minus in math. Twice."),
("b03","N","But one percent stacks. Thirty four insults, and you're officially a genius. Seventy, and your I Q is two hundred."),
("b04","N","Two hundred thirty one insults... and you'd have an I Q of one thousand. No human in history has ever come close."),
("c01","N","Day one. Kyle calls you stupid in the hallway. Plus one percent."),
("c02","N","Your sister calls you stupid at breakfast. She does that every morning. Plus one percent."),
("c03","N","By lunch, you've read every book in the school library. By dinner, you speak French. And Japanese. And a little bit of Latin."),
("c04","N","[smug] So you get smart. Really smart. You start doing stupid things... on purpose."),
("c05","N","You wear socks with sandals. You walk into a glass door. Twice. You put pineapple on pizza... in front of the whole cafeteria."),
("c06","KID","[laughing] Dude, you're SO dumb!"),
("c07","N","Plus one. Plus one. Plus one. By Friday, your I Q is two hundred. You finish your math test in four minutes. Your teacher cries."),
("d01","N","Then someone posts a video. The kid who gets smarter when you call him stupid."),
("d02","N","[building] And the whole internet joins in. Millions of comments. Stupid. Idiot. Brainless. Dumbest kid alive. Every single one makes you smarter."),
("d03","N","Plus one percent. Plus one percent. Faster than you can scroll."),
("d04","N","By morning, your I Q is one thousand. You can see math in everything. In raindrops. In the way your cereal floats."),
("d05","N","[awed] Scientists fly in from around the world. You solve a problem they've been stuck on for thirty years. On a napkin. In nine minutes."),
("d06","N","Your face is on every news channel. The smartest person who has ever lived. And he's fifteen."),
("e01","N","[tense] But there's a problem nobody warned you about."),
("e02","N","When your mind runs a thousand times faster, the world starts to feel... slow. Conversations feel like waiting for a song to load. Jokes feel like puzzles you solved hours ago."),
("e03","N","You stop laughing with your friends. You start correcting them."),
("e04","N","[cold] And one night at dinner, your dad tries to read a letter out loud. He struggles with the long words. He always has. And you sigh. Loudly."),
("e05","DAD","[hurt, quiet] Sorry, Leo. I'm... I'm not as smart as you."),
("e06","N","[quietly] Plus one percent. Because even your dad just called himself stupid... and somehow that counts."),
("e07","N","Your brain is buzzing. You can't sleep. You can't stop thinking. And for the first time, you feel completely alone."),
("f01","N","There's only one way back. People have to tell you that you're smart. Each time... minus one percent."),
("f02","N","But nobody does. Why would they? You're a genius. Saying it out loud feels pointless."),
("f03","N","[softly] And then your sister sits next to you on the stairs."),
("f04","MIA","[gently] You're smart, Leo. You were always smart. Even when you got a C minus."),
("f05","N","Minus one percent."),
("f06","MIA","[smiling, tearful] You were smart when you taught me to ride a bike. You were smart when you knew I was sad before I said anything."),
("f07","N","Minus one. Minus one. The buzzing gets quieter."),
("f08","DAD","[warm] You're the smartest kid I know. You always were. Not because of a number."),
("f09","N","[emotional] Your dad says it every night. Your mom says it at breakfast. Your friends say it at lunch."),
("f10","N","Nine hundred. Five hundred. Two hundred. A hundred and forty."),
("g01","N","Three weeks later, your I Q is back to a hundred. Perfectly average."),
("g02","N","And you understand something no I Q test can measure. Being smart was never about being faster than everyone else."),
("g03","N","[softly] It was about understanding the people next to you."),
("g04","MIA","[teasing] Also, you're stupid."),
("g05","N","[pause] Plus one percent."),
("g06","N","Who in your life makes you feel smart? Tag them in the comments."),
]
PAUSE = {"a01":0.2,"a02":0.6,"a03":0.5,"a04":1.1,"b01":0.5,"b02":0.5,"b03":0.6,"b04":1.0,"c03":0.5,"c04":0.3,"c05":0.4,"c06":0.3,"c07":1.0,
 "d01":0.6,"d02":0.3,"d03":0.5,"d04":0.5,"d05":0.6,"d06":1.0,"e01":0.8,"e02":0.5,"e03":0.6,"e04":0.5,"e05":0.8,"e06":0.6,"e07":1.2,
 "f01":0.8,"f02":0.6,"f03":0.6,"f04":0.6,"f05":0.6,"f06":0.6,"f07":0.6,"f08":0.8,"f09":0.6,"f10":1.2,"g01":0.6,"g02":0.5,"g03":1.0,"g04":0.6,"g05":1.0}
lines = []
for i, s, el in L:
    t = re.sub(r"\[[^\]]*\]\s*", "", el).strip()
    lines.append({"id": i, "s": s, "t": t, "el": el, "p": PAUSE.get(i, 0.32)})
cast = {"N": {"voice": "am_michael", "speed": 0.95}, "MIA": {"voice": "af_heart", "speed": 1.0}, "KID": {"voice": "am_puck", "speed": 1.05}, "DAD": {"voice": "bm_george", "speed": 0.95}}
json.dump({"title": "What If You Got 1% Smarter Every Time Someone Called You Stupid?", "cast": cast, "lines": lines}, open("lines.json", "w"), indent=1)
w = sum(len(l["t"].split()) for l in lines)
print(len(lines), "lines", w, "words ~", round(w / 145, 1), "min")
