import json, re
# (id, speaker, text-with-v3-tags)
L = [
# A cold open
("a01","N","[tense] A basketball hits you in the face."),
("a02","N","And then... you see it coming."),
("a03","N","You see Jake throw it. You see it fly. You see it hit you. One full second after it already did."),
("a04","MIA","[confused] Did you just... not see that?"),
("a05","N","Your nose is bleeding. And your eyes are still catching up."),
("a06","N","[slowly] Because starting today... your life has lag."),
("a07","N","[ominous] And every single day, the lag doubles."),
# B rule + science
("b01","N","Here's the rule. Everything you see, hear and feel reaches you late. Your body still lives in the present. But your senses are stuck in the past."),
("b02","N","Day one: one second. Day two: two. Day three: four. And it never, ever stops."),
("b03","N","[curious] And the weird part? You were already lagging."),
("b04","N","Your brain needs about a tenth of a second to process what your eyes see. So every human alive is living slightly in the past. You just got... a lot worse at it."),
# C day 1
("c01","N","Day one. One second doesn't sound like much."),
("c02","N","[amused] Until you try to high-five someone."),
("c03","N","You laugh at jokes a second after everyone else. You answer questions that were already answered."),
("c04","N","Mia, your little sister, figures it out in about five minutes."),
("c05","MIA","[mischievously] Watch this. Hey! Catch!"),
("c06","N","[deadpan] You do not catch."),
("c07","N","Soup? Messy. Stairs? Dangerous. Video games? Impossible. Your ping is now a thousand milliseconds. In real life."),
("c08","N","Fun fact: light from the Moon takes about one point three seconds to reach your eyes. So today, your whole world feels about as far away as the Moon."),
# D day 3-5
("d01","N","Day three. Four seconds."),
("d02","N","Conversations fall apart. Someone asks you a question. You hear it four seconds later. By the time you answer, they've already walked away."),
("d03","N","Day five. Sixteen seconds."),
("d04","N","[serious] And that's when you learn the scariest thing about lag."),
("d05","N","You step off the curb. The street looks empty."),
("d06","N","[whispers] It was empty. Sixteen seconds ago."),
("d07","N","[urgent] A horn screams. Something yanks your hoodie back. And sixteen seconds later, you finally see it. A truck. And Mia. Holding onto you with both hands."),
("d08","MIA","[crying, shaky] You can't go outside alone anymore. Okay? Promise me."),
# E day 7
("e01","N","Day seven. Sixty-four seconds. More than a full minute."),
("e02","N","Your parents take you to the hospital. The doctors run every test. Eyes: perfect. Ears: perfect. Brain scan: perfect."),
("e03","DOC","[puzzled] Everything works. It just... arrives late. Like a video that's buffering."),
("e04","N","Then you look in a mirror. [pause] And it's empty."),
("e05","N","You stand there. You wait. And a minute later, you walk in. You watch yourself, from one minute ago, walk into the room."),
("e06","N","[quietly] You're not looking at a mirror anymore. You're watching a recording."),
# F day 10
("f01","N","Day ten. Five hundred and twelve seconds. About eight and a half minutes."),
("f02","N","[intrigued] And here's the strange part. That's almost exactly how long sunlight takes to reach the Earth."),
("f03","N","Whenever anyone looks at the Sun, they see it as it was eight minutes ago. Now you see your entire world that way."),
("f04","N","Someone posts a video of you. The boy who lives eight minutes in the past. Ten million views in one day."),
("f05","N","Scientists want to study you. Strangers want to test you. But you only want one thing. To see the present. [softly] Even for one second."),
# G day 14
("g01","N","Day fourteen. Two hours and sixteen minutes."),
("g02","N","You wake up at seven in the morning. And it's pitch black."),
("g03","N","Because your eyes are still living at five a.m."),
("g04","N","Your life splits in two. Your body is in one time. Your world is in another."),
("g05","N","So you learn to live by memory. Twelve steps to the kitchen. Four to the fridge. Mia puts tape on the floor, so you can feel the way."),
("g06","MIA","[gently] Left. Left. Stop. Okay, you're at the table. I'll tell Mom you said thanks."),
# H day 18
("h01","N","Day eighteen. Thirty-six hours. You're living a day and a half in the past."),
("h02","N","[sad] And now, you see everything too late to help."),
("h03","N","You watch Mia come home from school, crying, sitting alone on the stairs. You run to her. But the stairs are empty."),
("h04","N","That happened yesterday. She's already fine. She's already asleep."),
("h05","N","[softly] You can see everything. You just can't change any of it."),
# I day 22
("i01","N","Day twenty-two. Twenty-four days."),
("i02","N","Your birthday happens. Cake. Candles. Your whole family singing."),
("i03","N","And you won't see any of it for three and a half weeks."),
("i04","N","So on a quiet Tuesday, alone in an empty living room, the party finally reaches you. Balloons appear out of nowhere. Your family sings to an empty chair."),
("i05","N","[emotional] So you sit down in it. Three weeks late. And you blow out candles that aren't there anymore."),
# J day 26
("j01","N","Day twenty-six. The number on your screen reads thirty-three million seconds. More than a year."),
("j02","N","And then something happens. You walk into your room... and Biscuit is on your bed."),
("j03","N","[emotional] Biscuit. Your dog. The one you buried last spring."),
("j04","N","He looks up. His tail thumps the blanket. Because to your eyes, it's a year ago. And he's still here."),
("j05","N","[softly] You sit next to him for hours. You can't touch him. You don't care."),
("j06","N","And for the first time, you don't want the lag to stop."),
("j07","N","And the next morning... it doesn't move. Day twenty-seven: one year. Day twenty-eight: one year. The doubling has stopped. You're stuck. Exactly one year behind everyone you love."),
# K Mia's notes
("k01","N","That night, your mom finds a box of sticky notes under Mia's bed. Hundreds of them."),
("k02","N","She's been leaving you messages. Not for you now. For the you who will see this room a year from now."),
("k03","MIA","[softly, warm] Hi. It's Mia. Today is day one for me. You'll see this in a year. I'm still here."),
("k04","N","Every single day, she writes one. Because she figured out the one thing the doctors missed."),
("k05","N","[emotional] Nothing you lose to the lag is ever really lost. Every hug. Every word. Every hand that held yours. It all still reaches you. Just... late."),
("k06","N","[very softly] And one morning, a year later, you feel it. Small fingers. Squeezing your hand. Right on time."),
# L twist
("l01","N","[mysterious] Day four hundred. The number on your screen changes color."),
("l02","N","It turns green. And it starts going down."),
("l03","N","[building] Thirty million. Ten million. Ten thousand. Ten. Three. Two. One."),
("l04","N","[whispers] Zero."),
("l05","N","[pause] And then... minus one."),
("l06","N","Now you're seeing one second into the future."),
("l07","N","But that's another story. [warmly] Would you take the lag... if it meant one more day with someone you lost? Tell me in the comments."),
]
PAUSE = {"a02":0.5,"a05":0.4,"a06":0.6,"a07":1.2,"b02":0.5,"b04":1.0,"c02":0.5,"c05":0.25,"c06":0.7,"c08":1.0,
 "d01":0.4,"d02":0.6,"d03":0.5,"d05":0.6,"d06":0.9,"d07":0.4,"d08":1.2,"e01":0.5,"e03":0.6,"e04":0.9,"e06":1.2,
 "f01":0.5,"f03":0.6,"f05":1.2,"g01":0.5,"g02":0.6,"g03":0.6,"g06":1.2,"h01":0.5,"h03":0.9,"h05":1.4,
 "i01":0.5,"i03":0.7,"i05":1.5,"j01":0.6,"j02":0.9,"j03":0.8,"j05":0.7,"j06":1.0,"j07":1.3,"k02":0.6,"k03":0.9,
 "k05":0.8,"k06":1.6,"l01":0.5,"l02":0.4,"l03":0.6,"l04":1.0,"l05":0.6,"l06":0.9}
lines = []
for i, s, el in L:
    t = re.sub(r"\[[^\]]*\]\s*", "", el).strip()
    lines.append({"id": i, "s": s, "t": t, "el": el, "p": PAUSE.get(i, 0.32)})
cast = {"N": {"voice": "am_michael", "speed": 0.95, "el": "Brian"}, "MIA": {"voice": "af_heart", "speed": 1.0, "el": "TBD child"}, "DOC": {"voice": "bm_george", "speed": 0.95, "el": "TBD"}}
json.dump({"title": "What If You Started Lagging and Couldn't Stop?", "cast": cast, "lines": lines}, open("lines.json", "w"), indent=1)
w = sum(len(l["t"].split()) for l in lines); c = sum(len(l["el"]) for l in lines)
print(len(lines), "lines", w, "words", c, "chars  ~", round(w / 145, 1), "min")
for sp in ("N","MIA","DOC"): print(sp, sum(len(l["el"]) for l in lines if l["s"]==sp))
