import type { Category, Place } from "./types";

/* ------------------------------------------------------------------ *
 * Raw seed data ported verbatim from nyc-food-trip.html
 * (CAT / PLACES / DAYS). Kept in the original compact shape and
 * transformed below into the typed Place / Category structures.
 * ------------------------------------------------------------------ */

const CAT: Record<string, { n: string; c: string }> = {
  del: { n: "Bagels & Delis", c: "#2563eb" },
  pza: { n: "Pizza & Italian", c: "#dc2626" },
  bak: { n: "Bakeries & Sweets", c: "#db2777" },
  cof: { n: "Coffee", c: "#92400e" },
  sav: { n: "Tacos · Burgers · Halal · Sandwiches", c: "#ea580c" },
  stk: { n: "Steakhouse", c: "#15803d" },
  bar: { n: "Bars & Rooftops", c: "#7c3aed" },
  nit: { n: "Nightlife & Comedy", c: "#4338ca" },
  act: { n: "Activities", c: "#0d9488" },
  home: { n: "Home base", c: "#111827" },
};

type RawBranch = [number, number, string, string];
interface RawPlace {
  n: number;
  c: string;
  nm: string;
  fm?: string;
  or?: string;
  pr?: string;
  rs?: string;
  ln?: string;
  hr?: string;
  fl?: string;
  b?: number;
  L: RawBranch[];
}

// prettier-ignore
const PLACES: RawPlace[] = [
{n:0,c:"home",nm:"Home Base — 630 First Ave",fm:"Your apartment (East Midtown / Kips Bay–Murray Hill border)",L:[[40.7445,-73.9715,"630 First Ave","East Midtown"]]},
{n:1,c:"del",nm:"Katz's Delicatessen",fm:"Hand-carved pastrami; the 'When Harry Met Sally' deli (since 1888)",or:"Pastrami on rye (hand-cut) w/ mustard; matzo ball soup; a knish; Dr. Brown's Cel-Ray",pr:"$30–40 pp (pastrami sandwich ~$29)",rs:"No — walk in, keep your ticket, pay on exit",ln:"Long lines midday/weekends. Weekday before 11am or 2–4pm; tip a cutter at the counter for faster service + a taste",hr:"Mon–Thu 8am–11pm; open 24h continuously Fri 8am → Sun 11pm",L:[[40.7223,-73.9874,"205 E Houston St","Lower East Side"]]},
{n:2,c:"del",nm:"2nd Ave Deli",fm:"Kosher pastrami, corned beef, matzo ball soup (no longer on 2nd Ave)",or:"Pastrami sandwich or the 'Instant Heart Attack'; chopped liver; matzo ball soup; latkes",pr:"$30–45 pp",rs:"No reservations at the delis",ln:"Moderate at peak lunch; go before noon or after 2pm",hr:"Murray Hill 11am–8pm daily",L:[[40.7455,-73.9800,"162 E 33rd St","Murray Hill — closest to base"]]},
{n:4,c:"del",nm:"Tompkins Square Bagels",fm:"Kettle-boiled bagels; 20+ house cream-cheese flavors",or:"Everything bagel + a specialty cream cheese (jalapeño or maple-bacon-scallion); breakfast sandwiches",pr:"$10–18 pp",rs:"No",ln:"Busy weekend mornings at Ave A; go early or weekday",hr:"Ave A 7am–5pm daily; others ~6:30am–5/6:30pm",b:0,L:[[40.7268,-73.9820,"165 Avenue A (at E 10th)","East Village — original"],[40.7314,-73.9868,"184 Second Ave","East Village"],[40.7375,-73.9907,"23 E 17th St","Union Sq / Flatiron"]]},
{n:5,c:"del",nm:"Apollo Bagels",fm:"Cult naturally-leavened bagels that sell out daily",or:"Everything bagel with bacon-scallion or plain cream cheese; the nova bagel",pr:"$8–16 pp",rs:"No — frequently sells out",ln:"Notorious lines at East Village; arrive right at 7am — they close when sold out",hr:"7am–5pm daily",L:[[40.7425,-73.9800,"416 Third Ave","Kips Bay — near base"]]},
{n:7,c:"pza",nm:"L'Industrie Pizzeria",fm:"Thin-crust NY slices (often called NYC's best); great gelato",or:"Burrata slice (signature), Margherita, pesto slice; Wed sandwich specials; gelato w/ olive oil + salt",pr:"$10–18 pp",rs:"No",ln:"Long lines (esp. West Village & Little Italy) but moves fast; go at noon open or ~2–4pm",hr:"Daily ~12pm–10pm",b:0,L:[[40.7332,-74.0049,"104 Christopher St","West Village"],[40.7188,-73.9973,"197 Grand St","Little Italy (opened Mar 2026)"]]},
{n:8,c:"pza",nm:"Jonny's Pizza",fm:"Crispy, charred NY-style pizza; late-night LES spot",or:"Vodka-sauce pizza; pepperoni slice with hot honey + burrata; garlic knots",pr:"$5–20 pp",rs:"No",ln:"Late-night rush; go early evening on a weekday",hr:"Sun–Tue 12pm–11pm, Wed 12pm–12am, Thu 12pm–2am, Fri–Sat 12pm–3:30am",L:[[40.7222,-73.9884,"173 Orchard St","Lower East Side"]]},
{n:9,c:"pza",nm:"Mama's TOO!",fm:"Roman-style square slices; a cacio e pepe square named among the world's best",or:"Cacio e Pepe square; Angry Nonna (hot soppressata + hot honey); cup-and-char pepperoni square",pr:"$8–20 pp",rs:"No",ln:"Lines at peak; pepperoni/cacio sell out — go at open or 2–5pm",hr:"Daily ~12pm–11pm",b:0,L:[[40.7337,-74.0037,"325 Bleecker St","West Village"]]},
{n:10,c:"pza",nm:"All'Antico Vinaio",fm:"Florentine schiacciata sandwiches on airy focaccia",or:"La Favolosa (salame, pecorino-artichoke cream, spicy eggplant); Del Boss (truffle); L'Inferno (porchetta/nduja)",pr:"$18–25 pp",rs:"No",ln:"Shorter now with many branches; occasional midday rush",hr:"Varies ~11am–8/9pm daily",b:1,L:[[40.7295,-73.9990,"225 Sullivan St","Greenwich Village"],[40.7332,-74.0020,"89 Seventh Ave South","West Village"],[40.7440,-73.9905,"22 W 25th St","NoMad"],[40.7546,-73.9860,"1450 Broadway","Times Sq / Garment"]]},
{n:11,c:"bak",nm:"Levain Bakery",fm:"Massive 6-oz gooey chocolate-chip walnut cookies",or:"Chocolate Chip Walnut cookie (signature); Dark Chocolate Peanut Butter Chip",pr:"$6–10 pp (cookie ~$5–6)",rs:"No",ln:"Go at open or after 4pm; Amsterdam Ave branch has shorter lines than the old W 74th original",hr:"Daily ~8am–9/10pm",b:0,L:[[40.7820,-73.9800,"351 Amsterdam Ave","Upper West Side"],[40.7255,-73.9945,"340 Lafayette St","NoHo"],[40.7390,-73.9925,"2 W 18th St","Flatiron"]]},
{n:12,c:"bak",nm:"Magnolia Bakery",fm:"Banana pudding; classic swirl-frosted cupcakes",or:"Classic Banana Pudding; a vanilla/vanilla cupcake",pr:"$6–12 pp",rs:"No",ln:"Moderate; busiest midday/evening. Weekday mornings calmest",hr:"Bleecker ~9:30am–10/11pm; others vary",b:0,L:[[40.7358,-74.0050,"401 Bleecker St","West Village — original"],[40.7527,-73.9772,"89 E 42nd St","Grand Central"]]},
{n:13,c:"bak",nm:"Breads Bakery",fm:"Nutella + dark-chocolate babka; rugelach",or:"Chocolate babka; chocolate rugelach; canelé",pr:"$8–15 pp",rs:"No",ln:"Union Sq packed midday; short elsewhere. Mornings best",hr:"Union Sq ~7am–8pm daily",b:0,L:[[40.7370,-73.9905,"18 E 16th St","Union Square — flagship"],[40.7540,-73.9840,"1080 Sixth Ave","Bryant Park"]]},
{n:14,c:"bak",nm:"Veniero's Pasticceria",fm:"Italian cheesecake, cannoli, historic sit-down caffè (since 1894)",or:"Cannoli (filled to order); Italian cheesecake; lobster tail (sfogliatella)",pr:"$10–20 pp dine-in",rs:"No",ln:"Ticket counter; busy weekend evenings. Weekday afternoon best",hr:"Sun–Thu 8am–10pm, Fri–Sat 8am–11pm",L:[[40.7305,-73.9840,"342 E 11th St","East Village"]]},
{n:15,c:"bak",nm:"Eileen's Special Cheesecake",fm:"Individual mini cheesecakes in dozens of flavors (since 1974)",or:"Salted caramel (bestseller); strawberry; mini tarts",pr:"$7–9 pp (~$7/piece)",rs:"No",ln:"Quick counter, short wait — any weekday",hr:"Sun–Thu 11am–7pm, Fri–Sat 11am–8pm",L:[[40.7215,-73.9965,"17 Cleveland Pl","Nolita"]]},
{n:16,c:"bak",nm:"Janie's Life-Changing Baked Goods",fm:"Oversized cookies and brownies",or:"Chocolate chip cookie; brownies; seasonal specials",pr:"$6–12 pp",rs:"No",ln:"Small shops; usually quick on weekdays",hr:"West Village daily ~10am–11pm",b:1,fl:"UWS branch relocating to 434 Amsterdam Ave (mid-2026) — confirm which door is open before going.",L:[[40.7845,-73.9765,"434 Amsterdam Ave","Upper West Side (relocating)"],[40.7335,-74.0025,"82 Christopher St","West Village"],[40.7930,-73.9375,"2118 Second Ave","East Harlem"]]},
{n:17,c:"bak",nm:"Hani's Bakery + Café",fm:"Pastry-chef laminated pastries; Brooklyn blackout cake",or:"Blackberry-corn croissant; triple chocolate chunk cookie; cookie-butter monkey bread",pr:"$10–18 pp",rs:"No",ln:"Manageable on weekdays; can spike weekends",hr:"Weekdays ~7:30am–4:30pm (weekend hours unverified — best on a weekday)",L:[[40.7291,-73.9899,"67 Cooper Square (Astor Pl)","East Village / NoHo"]]},
{n:18,c:"bak",nm:"Le Fournil",fm:"Third-generation French boulangerie — baguettes, croissants",or:"Butter croissant; almond/pistachio croissant; baguette",pr:"$6–15 pp",rs:"No",ln:"Morning pastry rush; items sell out — go early-mid morning",hr:"East Village ~Mon–Sat 7:30am–6pm, Sun 9am–3pm (confirm locally)",fl:"UES branch permanently closed (2026). Only the East Village location remains.",L:[[40.7279,-73.9885,"115 Second Ave","East Village"]]},
{n:19,c:"bak",nm:"Sunday Morning (Cinnamon Rolls)",fm:"Small-batch cinnamon rolls in ~10 rotating flavors, baked all day",or:"Classic glazed roll + a rotating flavor (Ube Macapuno, Caramel Pecan, Guava & Cheese)",pr:"$8–15 pp",rs:"No",ln:"Line out the door but moves fast; popular flavors sell out — go at open or late morning",hr:"Mon–Fri 9am–4pm, Sat–Sun 10am–4pm",L:[[40.7235,-73.9805,"29 Avenue B","East Village"]]},
{n:20,c:"cof",nm:"Culture Espresso",fm:"Award-winning chocolate-chip cookies; strong espresso",or:"Chocolate chip cookie (baked ~hourly); cappuccino/latte",pr:"$5–12 pp",rs:"No",ln:"Cookies drop warm on the hour; morning rush — time a fresh batch",hr:"72 W 38th daily 7am–7pm; others Mon–Fri 7am–7pm, Sat–Sun 8am–5pm",b:0,L:[[40.7527,-73.9838,"72 W 38th St","Bryant Park / Midtown — flagship"],[40.7529,-73.9915,"247 W 36th St","Garment District"]]},
{n:21,c:"sav",nm:"Los Tacos No. 1",fm:"Tijuana-style tacos, handmade tortillas, mesquite-grilled meats",or:"Adobada (pork off the trompo) taco; carne asada taco; adobada fried quesadilla; horchata",pr:"$15–25 pp (tacos ~$6 ea)",rs:"No — walk-up counter, no seating",ln:"10–30 min at peak; go mid-afternoon or before 6pm",hr:"Chelsea Market 11am–10pm daily; others to ~11pm/midnight",b:0,L:[[40.7425,-74.0061,"75 Ninth Ave (Chelsea Market)","Chelsea — original"],[40.7522,-73.9779,"125 Park Ave","Grand Central"],[40.7256,-73.9948,"340 Lafayette St","NoHo"],[40.7376,-73.9880,"200 Park Ave South","Union Square"]]},
{n:23,c:"sav",nm:"Adel's Famous Halal Food",fm:"Viral late-night halal cart — signature deep-red spicy rice + white sauce",or:"Chicken over rice (ask half spicy/half yellow) with white + hot sauce; lamb gyro",pr:"$9 cash / $10–12 card",rs:"No",ln:"20–40 min weeknights, 60–90 min weekends; go at ~6pm open or a weeknight",hr:"Sun–Thu 6pm–4am, Fri–Sat 6pm–5am (evening/late-night only)",L:[[40.7602,-73.9820,"SW corner W 49th St & 6th Ave","Midtown"]]},
{n:24,c:"sav",nm:"Shawarma Bay",fm:"Afghan-spiced halal; generous platters",or:"Chicken shawarma platter; chapli kebab platter; falafel platter",pr:"$12–15 pp",rs:"No",ln:"Moderate late-night lines at the truck; best before midnight",hr:"Truck Mon–Thu 7:30pm–3am, Fri–Sat to 4am, Sun to 2:30am (evening only)",b:0,fl:"Very similar to Adel's (halal) — pick one; Adel's is the pick, Shawarma Bay the backup.",L:[[40.7605,-73.9790,"1290 Sixth Ave (truck)","Midtown West"],[40.7585,-73.9620,"401 E 57th St","Sutton Place"]]},
{n:25,c:"sav",nm:"Danny & Coop's Cheesesteaks",fm:"South Philly cheesesteaks; co-founded by Bradley Cooper — one-item menu, takeout",or:"The cheesesteak (~$21); sweet or hot peppers on the side",pr:"$21–25 pp",rs:"No — walk-up, takeout only",ln:"15–30 min at peak. Midweek afternoon best",hr:"Sun–Thu 12pm–7pm, Fri–Sat 12pm–9pm",L:[[40.7268,-73.9838,"151 Avenue A","East Village"]]},
{n:26,c:"stk",nm:"Smith & Wollensky",fm:"USDA Prime dry-aged steaks; old-school NYC steakhouse (since 1977)",or:"Dry-aged NY strip or porterhouse for two; creamed spinach; hash browns",pr:"$100+ pp à la carte",rs:"Recommended (OpenTable). Walk-ins at adjacent Wollensky's Grill",ln:"Minimal with a reservation",hr:"Lunch Mon–Fri; dinner nightly to ~10:30–11pm; open 7 days",L:[[40.7549,-73.9705,"797 Third Ave (at E 49th)","Midtown East — near base"]]},
{n:27,c:"bar",nm:"Artie's Backroom & Rooftop (Pod 39)",fm:"Seasonal open-air rooftop + sports lounge; local Murray Hill crowd",or:"Craft cocktails, margaritas, spritzes; Arthur & Sons Italian downstairs",pr:"$$",rs:"Walk-in friendly; happy hour 3–6pm",ln:"Weekend evenings busiest",hr:"Daily ~3pm–11pm (rooftop seasonal)",L:[[40.7488,-73.9772,"145 E 39th St","Murray Hill — ~10 min from base"]]},
{n:28,c:"bar",nm:"Bella Union",fm:"Tri-level bar with a winterized rooftop; Empire State & Chrysler views",or:"Rooftop cocktails; solid bar food; DJ after ~10pm",pr:"$$–$$$",rs:"Reservations for parties of 6+; smart-casual",ln:"Fri–Sat nights busy (DJ from ~10pm)",hr:"Sun–Thu 11am–2am, Fri–Sat 11am–4am",L:[[40.7423,-73.9805,"411 Third Ave (near E 29th)","Murray Hill — ~12 min from base"]]},
{n:29,c:"bar",nm:"Paddy Reilly's Music Bar",fm:"Legendary Irish pub; live music 7 nights/week",or:"Guinness; live Irish trad/rock, bluegrass, open mic",pr:"$$",rs:"No cover/reservations typically; casual",ln:"Liveliest Fri–Sat; happy hour 3–7pm",hr:"Mon–Tue 11am–2am, Wed–Sat 11am–4am, Sun 12pm–2am",L:[[40.7420,-73.9789,"519 Second Ave (at E 29th)","Murray Hill — ~7 min from base"]]},
{n:30,c:"bar",nm:"Banc Café",fm:"Neighborhood bar-restaurant in a 1920s former bank",or:"Cocktails + American fare; lively bar scene, some live music",pr:"$$",rs:"Resy available; casual",ln:"Weekend evenings",hr:"Mon–Tue 3pm–4am, Wed–Sun 12pm–4am",L:[[40.7428,-73.9802,"431 Third Ave (near E 30th)","Murray Hill — ~11 min from base"]]},
{n:31,c:"bar",nm:"The Biergarten at The Standard",fm:"Open-air German beer garden under the High Line; ping-pong, big energy",or:"Liter steins of German draft; pretzels; bratwurst",pr:"$$",rs:"Mostly first-come; casual — long waits summer weekends",ln:"Warm evenings busiest",hr:"Summer ~2pm (12pm weekends) to ~11pm/2am Fri–Sat",L:[[40.7409,-74.0080,"848 Washington St","Meatpacking"]]},
{n:32,c:"bar",nm:"Brass Monkey",fm:"Casual multi-level pub with a rooftop deck; strong beer bar",or:"~20 drafts, 50+ bottles, whiskeys; house burgers",pr:"$$",rs:"Walk-in; casual (no dress-code hassle)",ln:"Crowded weekend nights; rooftop in good weather",hr:"Mon–Tue 12pm–2am, Wed–Thu to 3am, Fri–Sat to 4am, Sun 1pm–2am",L:[[40.7405,-74.0075,"55 Little W 12th St","Meatpacking"]]},
{n:33,c:"bar",nm:"Le Bain",fm:"Iconic rooftop disco at The Standard — dance floor, disco-ball plunge pool, terrace views",or:"Dancing; sunset parties on the terrace",pr:"$$$",rs:"Resy/event tickets recommended; line/guestlist busy nights",ln:"Wed–Sat; arrive early to skip lines",hr:"Wed–Fri 4pm–4am, Sat 2pm–4am, Sun 2pm–12am, Mon–Tue to 12am",fl:"21+ and a real dress code: no sportswear, jerseys, sneakers, or hats. Was closed 7/15–7/20 but reopens before your 7/23 arrival.",L:[[40.7407,-74.0079,"444 W 13th St (18th fl)","Meatpacking"]]},
{n:39,c:"bar",nm:"Somewhere Nowhere",fm:"Rooftop pool club atop the Renaissance Chelsea (38/39th fl); DJ sets, very Le Bain-adjacent scene",or:"Rooftop pool + cocktails by day; nightlife programming Fri–Sun after 11pm",pr:"$$$",rs:"Reservations up to 30 days ahead; walk-ins by availability",ln:"Nightlife Fri–Sun 11pm–4am; arrive early on weekends",hr:"Wed 5pm–1am, Thu–Fri 12pm–11pm, Sat–Sun 12pm–4am (closed Mon–Tue)",fl:"21+ with valid ID. Address is 112 W 25th St (not 12 W 21st).",L:[[40.7447,-73.9915,"112 W 25th St (Renaissance Chelsea, Fl 38–39)","Chelsea / NoMad"]]},
{n:40,c:"bar",nm:"230 Fifth Rooftop",fm:"Huge open-air rooftop with Empire State views; loud, tourist-friendly, fun for a group",or:"Cocktails on the open deck; heated igloos in cold months",pr:"$$–$$$",rs:"Reservations recommended for groups; smart-casual",ln:"Very busy weekend nights",hr:"Daily ~11am–2/4am",L:[[40.7442,-73.9880,"230 Fifth Ave","NoMad"]]},
{n:41,c:"bar",nm:"PHD Rooftop at Dream Downtown",fm:"Rooftop lounge near Brass Monkey / Le Bain; late-night dance-floor energy",or:"Cocktails + DJ; indoor-outdoor space with skyline views",pr:"$$$",rs:"Table/guestlist recommended busy nights; dress code",ln:"Fri–Sat busiest",hr:"Evenings, late (varies by event)",L:[[40.7423,-74.0043,"355 W 16th St (Dream Downtown)","Meatpacking / Chelsea"]]},
{n:42,c:"bar",nm:"The Ainsworth",fm:"Sports-bar-meets-beer-hall; similar crowd to Brass Monkey",or:"Beers, cocktails, wings; big-screen sports",pr:"$$",rs:"Walk-in friendly; casual",ln:"Game days and weekend nights busiest",hr:"Varies by location, generally to ~2–4am",b:0,L:[[40.7420,-73.9945,"122 W 26th St","Chelsea"],[40.7395,-73.9905,"45 E 20th St (Gramercy)","Flatiron / Gramercy"]]},
{n:43,c:"bar",nm:"Off the Wagon",fm:"Loud, fratty, easy bar literally next to Comedy Cellar",or:"Cheap beers, shots, bar games; good pre/post-show spot",pr:"$$",rs:"Walk-in; casual",ln:"Weekend nights packed",hr:"Daily ~12pm–4am",L:[[40.7302,-74.0003,"109 MacDougal St","West Village"]]},
{n:44,c:"bar",nm:"McSorley's Old Ale House",fm:"Historic no-frills ale house (since 1854); great group vibe, fits Day 3",or:"Two mugs of ale at a time — light or dark, that's the menu; cheese & crackers",pr:"$ (cash only)",rs:"No — walk in, communal tables",ln:"Weekend afternoons/evenings busy; sawdust floors, elbow-to-elbow",hr:"Mon–Sat 11am–1am, Sun 12pm–1am",L:[[40.7288,-73.9899,"15 E 7th St","East Village"]]},
{n:45,c:"bar",nm:"Doc Holliday's",fm:"East Village dive bar — jukebox, cheap drinks, good chaser to a bigger night",or:"Cheap beer + whiskey; jukebox",pr:"$",rs:"No; casual dive",ln:"Chill early, busier late",hr:"Daily ~1pm–4am",L:[[40.7255,-73.9835,"141 Avenue A","East Village"]]},
{n:46,c:"bar",nm:"Employees Only",fm:"Speakeasy-style West Village institution; excellent cocktails (already a hidden-gem pick)",or:"Signature cocktails (Ginger Smash, Mata Hari); late-night kitchen",pr:"$$$",rs:"Walk-in with a wait; reservations for dining",ln:"Fri–Sat busy from ~9pm",hr:"Daily ~6pm–4am",L:[[40.7332,-74.0069,"510 Hudson St","West Village"]]},
{n:47,c:"bar",nm:"Attaboy",fm:"No-menu LES cocktail den — tell the bartender your mood, they build the drink",or:"Bartender's-choice cocktails (no menu)",pr:"$$$",rs:"No — walk-in, small room, expect a wait",ln:"Fills fast on weekends; go early",hr:"Daily ~6pm–4am",L:[[40.7185,-73.9910,"134 Eldridge St","Lower East Side"]]},
{n:48,c:"bar",nm:"Amor y Amargo",fm:"Tiny bitters-focused cocktail bar; great for a quieter pre-dinner drink",or:"Spirit-forward, bitters-driven cocktails (Negronis, amaro flights)",pr:"$$",rs:"No; very small",ln:"Cozy — best early evening",hr:"Daily ~1pm–12am (varies)",L:[[40.7256,-73.9840,"443 E 6th St","East Village"]]},
{n:49,c:"bar",nm:"Ten Bells",fm:"Relaxed LES natural-wine bar with small plates",or:"Natural wine by the glass; oysters + tapas",pr:"$$",rs:"Walk-in; casual",ln:"Weekend evenings busy",hr:"Daily ~5pm–2am",L:[[40.7175,-73.9905,"247 Broome St","Lower East Side"]]},
{n:50,c:"bar",nm:"The Up & Up",fm:"Speakeasy-feel cocktail bar, no cover, right by Comedy Cellar",or:"Craft cocktails in a low-lit basement room",pr:"$$$",rs:"Walk-in; can fill up post-show",ln:"Busy after Comedy Cellar sets",hr:"Daily ~5pm–2/4am",L:[[40.7303,-74.0002,"116 MacDougal St","West Village"]]},
{n:51,c:"bar",nm:"Katana Kitten",fm:"Japanese-inspired cocktails; playful, a bit of a scene without being a club",or:"Hi-ball, Toki Highball, Japanese-influenced cocktails + bar bites",pr:"$$$",rs:"Walk-in; can wait weekends",ln:"Fri–Sat busy",hr:"Daily ~5pm–2am",L:[[40.7333,-74.0068,"531 Hudson St","West Village"]]},
{n:52,c:"bar",nm:"Maison Premiere",fm:"Williamsburg oyster & absinthe bar; gorgeous room, lowkey but special (fits Day 3)",or:"Oysters (happy hour deal), absinthe cocktails, classic drinks",pr:"$$$",rs:"Reservations recommended; walk-in at the bar",ln:"Weekend evenings busy; happy hour 4–7pm popular",hr:"Daily ~2/4pm–2am",L:[[40.7175,-73.9615,"298 Bedford Ave","Williamsburg, BK"]]},
{n:53,c:"bar",nm:"The Ides at Wythe Hotel",fm:"Wythe Hotel rooftop near Superior Ingredients; mellower rooftop before the club",or:"Cocktails with Manhattan-skyline views from the deck",pr:"$$$",rs:"No reservations; line at the elevator on busy nights",ln:"Sunset + weekends busiest — go early",hr:"Daily ~4pm–12/1am (later Fri–Sat)",L:[[40.7220,-73.9583,"80 Wythe Ave (Wythe Hotel)","Williamsburg, BK"]]},
{n:55,c:"bar",nm:"The Ripple Room",fm:"Two-floor '70s-themed LES bar with pool tables + vintage photobooth; great for a big group",or:"$10 beer/shot combos, yuzu daiquiris downstairs; head upstairs to the clubbier dance floor",pr:"$$",rs:"Walk-in; no reservations",ln:"Packs out after ~10:40pm on weekends; go earlier to grab the upstairs",hr:"Evenings, late (varies) — busiest Thu–Sat",L:[[40.7213,-73.9935,"183 Bowery","Lower East Side"]]},
{n:56,c:"bar",nm:"Downtown Social",fm:"East Village sports bar turned late-night DJ spot; 30 screens, big group energy",or:"Bar staples + shareable plates, bold cocktails; DJs after the games",pr:"$$",rs:"Walk-in; groups welcome (private rooms for events)",ln:"Game days + weekend nights busy",hr:"Mon–Thu 3pm–1am, Fri 3pm–3:30am, Sat 12pm–3:30am, Sun 12pm–1am",L:[[40.7300,-73.9877,"149 Second Ave","East Village"]]},
{n:58,c:"bar",nm:"Monarch Rooftop",fm:"18th-floor Herald Square penthouse rooftop; Empire State views, DJs Fri–Sat, big-group friendly",or:"Specialty cocktails + small bites indoors/outdoors; table service for groups",pr:"$$–$$$",rs:"Reservations recommended for groups; no athletic wear",ln:"Weekend nights busy; DJs Fri–Sat",hr:"Sun–Mon 2pm–1am, Tue–Thu 2pm–2am, Fri–Sat 2pm–4am",L:[[40.7500,-73.9865,"71 W 35th St (18th fl, Courtyard Marriott)","Herald Square"]]},
{n:59,c:"bar",nm:"Refinery Rooftop",fm:"Glam rooftop atop the Refinery Hotel near Bryant Park; retractable glass roof, Empire State views",or:"Cocktails + American shareables (sliders, flatbreads); DJ nights",pr:"$$–$$$",rs:"Reservations recommended for a table",ln:"Evenings busy; livelier late Thu–Sat",hr:"Mon 11:30am–11pm, Tue–Wed to 12am, Thu–Fri to 1am, Sat 10:30am–2am, Sun 10:30am–11pm",L:[[40.7524,-73.9836,"63 W 38th St (atop Refinery Hotel)","Garment District / Bryant Park"]]},
{n:60,c:"bar",nm:"Royalton Park Avenue Rooftop",fm:"20th-floor NoMad rooftop bar + lounge with a year-round heated pool; skyline & Empire State views",or:"Seasonal cocktails + shareable plates poolside; floor-to-ceiling windows, wraparound terrace",pr:"$$$",rs:"Reservations recommended; pool-deck sofa reservations for non-hotel guests",ln:"Weekend evenings busiest",hr:"Daily 11am–late (kitchen to ~10pm)",L:[[40.7430,-73.9838,"420 Park Ave South (at E 29th, 20th fl)","NoMad — near base"]]},
{n:34,c:"nit",nm:"Comedy Cellar",fm:"World-famous stand-up, 7 nights/week; surprise A-list drop-ins",or:"Book the MacDougal St room or larger Village Underground; grab a bite at the Olive Tree above",pr:"$ — cover ~$15–25 + 2-item minimum pp",rs:"Strongly recommended — book online; times sell out, esp. weekends. Standby list ~2h before show",ln:"Weeknights easier; shows from ~7pm",hr:"Shows nightly, evening into late night",L:[[40.7300,-74.0004,"117 MacDougal St","Greenwich Village"],[40.7305,-74.0007,"130 W 3rd St (Village Underground)","Greenwich Village"]]},
{n:35,c:"nit",nm:"Elsewhere",fm:"Converted-warehouse club & arts space; multi-room + big seasonal rooftop",or:"Buy per-event tickets at elsewhere.club/events; rooftop best on warm nights",pr:"~$15–25+ per event",rs:"Advance tickets recommended for popular nights",ln:"Fri–Sat club nights; doors often ~10pm",hr:"By event, mostly Thu–Sun, runs to 2–4am",L:[[40.7085,-73.9330,"599 Johnson Ave (Morgan Ave L)","Bushwick, BK"]]},
{n:36,c:"nit",nm:"Superior Ingredients",fm:"20,000 sq-ft dance venue on the Williamsburg waterfront; retractable-roof deck with skyline views",or:"The Roof for warm summer nights; house/electronic DJs",pr:"Per-event (cover + bottle service)",rs:"Tickets via promoters; tables@si-bk.com",ln:"Thu–Sat; arrive ~10–11pm",hr:"Thu–Sat 10pm–4am, Sun 2pm–10pm (roof), Mon–Wed closed",fl:"Event-driven — confirm a specific event is booked for your night.",L:[[40.7222,-73.9575,"74 Wythe Ave (at N 12th)","Williamsburg, BK"]]},
{n:37,c:"act",nm:"American Museum of Natural History",fm:"Dinosaur halls, blue whale, Rose Center planetarium, Gilder Center",or:"Prioritize the fossil halls + blue whale; add a Hayden Planetarium show",pr:"Non-resident adult $37 (NY residents pay-what-you-wish); planetarium/specials extra",rs:"Timed-entry tickets recommended (tickets.amnh.org), esp. summer",ln:"Go at 10am open or after 3pm; weekends busiest. Budget 3–4 hrs",hr:"Daily 10am–5:30pm (last entry ~5pm)",L:[[40.7813,-73.9740,"200 Central Park West (W 79th)","Upper West Side"]]},
{n:38,c:"act",nm:"Five Iron Golf",fm:"Indoor golf simulators, sports bar, pool & shuffleboard",or:"Book a Trackman sim by the hour (fits your group); drinks + games",pr:"Per-sim hourly (dynamic; book the app for live rates)",rs:"Reserve online at booking.fiveirongolf.com",ln:"Weekday afternoons cheapest/open; eves & weekends busiest — book ahead",hr:"Grand Central Mon–Thu 6am–11pm, Fri to 1am, Sat 7am–1am, Sun 7am–11pm",L:[[40.7515,-73.9800,"101 Park Ave (Fl 3)","Grand Central — closest to base"]]},
{n:57,c:"act",nm:"Amsterdam Billiards & Bar",fm:"NYC's original upscale pool hall (since 1989); 25 Brunswick tables, ping pong, darts, foosball, full bar",or:"Book a pool or ping-pong table by the hour (up to 6 per table); drinks + games",pr:"~$110/table/hr Sun–Wed, ~$130 Thu–Sat (up to 6 people)",rs:"Reservations recommended; email to book, walk-ins by availability",ln:"Weekend evenings busiest — reserve ahead",hr:"Daily 11am–3am",L:[[40.7320,-73.9905,"110 E 11th St (at 4th Ave)","Union Square / East Village"]]},
];

/* ---------- day routes (raw labels, migrated into Entries) ---------- */
export interface RawDay {
  index: number;
  name: string;
  color: string;
  date: string;
  stops: [number, number, string][];
}

export const RAW_DAYS: RawDay[] = [
  {
    index: 1,
    name: "Day 1 · Thu Jul 23 — Midtown & West Village",
    color: "#e11d48",
    date: "2026-07-23",
    stops: [
      [40.7425, -73.98, "Breakfast — Apollo Bagels (Kips Bay)"],
      [40.7515, -73.98, "Morning — Five Iron Golf (Grand Central)"],
      [40.7522, -73.9779, "Lunch — Los Tacos No. 1 (Grand Central)"],
      [40.7332, -74.0049, "Slices — L'Industrie (West Village)"],
      [40.7358, -74.005, "Dessert — Magnolia Bakery (Bleecker)"],
      [40.7423, -73.9805, "Rooftop — Bella Union (Murray Hill)"],
      [40.742, -73.9789, "Nightcap — Paddy Reilly's (live music)"],
    ],
  },
  {
    index: 2,
    name: "Day 2 · Fri Jul 24 — West Village → Meatpacking",
    color: "#0891b2",
    date: "2026-07-24",
    stops: [
      [40.7377, -74.0087, "Late AM — West Village / Hudson piers / Little Island"],
      [40.7337, -74.0037, "Lunch — Mama's TOO! square (Bleecker)"],
      [40.7425, -74.0061, "Afternoon — Chelsea Market / High Line"],
      [40.73, -74.0004, "Comedy Cellar (booked show)"],
      [40.7409, -74.008, "Drinks — The Standard Biergarten"],
      [40.7405, -74.0075, "Brass Monkey (rooftop)"],
      [40.7407, -74.0079, "Le Bain (rooftop disco)"],
    ],
  },
  {
    index: 3,
    name: "Day 3 · Sat Jul 25 — East Village & Lower East Side",
    color: "#7c3aed",
    date: "2026-07-25",
    stops: [
      [40.7268, -73.982, "Breakfast — Tompkins Square Bagels (Ave A)"],
      [40.7235, -73.9805, "Cinnamon roll — Sunday Morning (Ave B)"],
      [40.7223, -73.9874, "Lunch — Katz's Deli pastrami"],
      [40.7215, -73.9965, "Dessert — Eileen's Special Cheesecake (Nolita)"],
      [40.7222, -73.9884, "Early dinner — Jonny's Pizza (Orchard St)"],
      [40.732, -73.9905, "Night — Amsterdam Billiards & Bar (E 11th St)"],
    ],
  },
  {
    index: 4,
    name: "Day 4 · Sun Jul 26 — Upper West Side → Midtown East",
    color: "#c2410c",
    date: "2026-07-26",
    stops: [
      [40.7889, -73.9755, "Breakfast — Barney Greengrass (Amsterdam Ave)"],
      [40.7813, -73.974, "Morning — American Museum of Natural History"],
      [40.782, -73.98, "Cookie — Levain Bakery (351 Amsterdam Ave)"],
      [40.7789, -73.973, "Stroll — Central Park (enter at W 72nd)"],
      [40.7549, -73.9705, "Farewell dinner — Smith & Wollensky (Midtown East)"],
      [40.7428, -73.9802, "Nightcap — Banc Café (Murray Hill)"],
    ],
  },
];

/* ---------- transforms to typed structures ---------- */

export const categories: Category[] = Object.entries(CAT).map(([key, v]) => ({
  key,
  name: v.n,
  color: v.c,
}));

export const CATEGORY_BY_KEY: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.key, c])
);

export const places: Place[] = PLACES.map((p) => ({
  id: p.n,
  category: p.c,
  name: p.nm,
  famousFor: p.fm,
  order: p.or,
  price: p.pr,
  reservations: p.rs,
  line: p.ln,
  hours: p.hr,
  flag: p.fl,
  bestBranchIndex: p.b,
  branches: p.L.map(([lat, lng, label, neighborhood]) => ({
    lat,
    lng,
    label,
    neighborhood,
  })),
}));

export const PLACE_BY_ID: Record<number, Place> = Object.fromEntries(
  places.map((p) => [p.id, p])
);

export const HOME_BASE = {
  lat: places[0].branches[0].lat,
  lng: places[0].branches[0].lng,
  label: "630 First Ave (home base)",
};
