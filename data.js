// data.js - Alle Lernmaterialien (Nur auf Deutsch)

const materialData = {
    nomen: {
      title: "Wichtige Nomen (A1-A2) nach Kategorien",
      description: "Eine Liste der wichtigsten Nomen, gruppiert nach Themen. Achten Sie auf den Artikel und die Pluralform.",
      categories: [
        {
          name: "Menschen & Familie",
          der: ["Mann (¨-er)", "Vater (¨-)", "Sohn (¨-e)", "Junge (-n)", "Bruder (¨-)", "Arzt (¨-e)", "Lehrer (-)"],
          die: ["Frau (-en)", "Mutter (¨-)", "Tochter (¨-)", "Oma (-s)", "Tante (-n)", "Familie (-n)", "Freundin (-nen)"],
          das: ["Kind (-er)", "Baby (-s)", "Mädchen (-)", "Paar (-e)", "Mitglied (-er)", "Leben (-)", "Alter (-)"]
        },
        {
          name: "Körper & Gesundheit",
          der: ["Kopf (¨-e)", "Arm (-e)", "Fuß (¨-e)", "Bauch (¨-e)", "Rücken (-)"],
          die: ["Hand (¨-e)", "Nase (-n)", "Haut (-en)", "Krankheit (-en)", "Apotheke (-n)"],
          das: ["Auge (-n)", "Ohr (-en)", "Bein (-e)", "Haar (-e)", "Gesicht (-er)"]
        },
        {
          name: "Essen & Trinken",
          der: ["Apfel (¨-)", "Kaffee (-s)", "Tee (-s)", "Saft (¨-e)", "Kuchen (-)"],
          die: ["Banane (-n)", "Milch (-)", "Wurst (¨-e)", "Kartoffel (-n)", "Pizza (-s)"],
          das: ["Brot (-e)", "Wasser (-)", "Fleisch (-)", "Ei (-er)", "Gemüse (-)"]
        },
        {
          name: "Haus & Wohnen",
          der: ["Tisch (-e)", "Stuhl (¨-e)", "Schrank (¨-e)", "Schlüssel (-)"],
          die: ["Tür (-en)", "Lampe (-n)", "Wand (¨-e)", "Küche (-n)"],
          das: ["Bett (-en)", "Fenster (-)", "Sofa (-s)", "Zimmer (-)"]
        },
        {
          name: "Natur & Zeit",
          der: ["Tag (-e)", "Monat (-e)", "Baum (¨-e)", "Berg (-e)", "Wald (¨-er)"],
          die: ["Nacht (¨-e)", "Woche (-n)", "Sonne (-n)", "Blume (-n)", "Zeit (-en)"],
          das: ["Jahr (-e)", "Wochenende (-n)", "Wetter (-)", "Meer (-e)", "Licht (-er)"]
        }
      ]
    },
    adjektive: {
      title: "Adjektive (Gegensätze)",
      description: "Wichtige Adjektiv-Paare für das A1/A2 Niveau.",
      headers: ["Adjektiv", "Gegenteil"],
      items: [
        { a: "heiß", b: "kalt" },
        { a: "warm", b: "kühl" },
        { a: "nass", b: "trocken" },
        { a: "hart", b: "weich" },
        { a: "stark", b: "schwach" },
        { a: "groß", b: "klein" },
        { a: "gut", b: "schlecht" },
        { a: "schnell", b: "langsam" },
        { a: "teuer", b: "billig" },
        { a: "neu", b: "alt" },
        { a: "jung", b: "alt" },
        { a: "leicht", b: "schwer" },
        { a: "laut", b: "leise" },
        { a: "sauber", b: "schmutzig" },
        { a: "hell", b: "dunkel" },
        { a: "voll", b: "leer" },
        { a: "richtig", b: "falsch" },
        { a: "einfach", b: "schwierig" }
      ]
    },
    verben: {
      title: "Top A1/A2 Verben",
      description: "Wichtige Verben mit Beispielen, Konjugation und Imperativ.",
      headers: ["Infinitiv", "Beispiel & Konjugation", "Imperativ"],
      items: [
        { 
          inf: "abholen", 
          notes: "Bsp: Ich hole dich ab.<br>Konj: hole ab, holst ab, holt ab, holen ab...", 
          imp: "hol ab / holen Sie ab" 
        },
        { 
          inf: "anziehen", 
          notes: "Bsp: Ich ziehe eine Jacke an.<br>Konj: ziehe an, ziehst an, zieht an...", 
          imp: "zieh an / ziehen Sie an" 
        },
        { 
          inf: "aussteigen", 
          notes: "Bsp: Wir steigen hier aus.<br>Konj: steige aus, steigst aus, steigt aus...", 
          imp: "steig aus / steigen Sie aus" 
        },
        { 
          inf: "einsteigen", 
          notes: "Bsp: Bitte steigen Sie ein!<br>Konj: steige ein, steigst ein, steigt ein...", 
          imp: "steig ein / steigen Sie ein" 
        },
        { 
          inf: "anfangen", 
          notes: "Bsp: Der Kurs fängt an.<br>Konj: fange an, fängst an, fängt an...", 
          imp: "fang an / fangen Sie an" 
        },
        { 
          inf: "anrufen", 
          notes: "Bsp: Ich rufe meine Mutter an.<br>Konj: rufe an, rufst an, ruft an...", 
          imp: "ruf an / rufen Sie an" 
        },
        { 
          inf: "aufstehen", 
          notes: "Bsp: Ich stehe um 7 Uhr auf.<br>Konj: stehe auf, stehst auf, steht auf...", 
          imp: "steh auf / stehen Sie auf" 
        },
        { 
          inf: "einkaufen", 
          notes: "Bsp: Ich kaufe im Supermarkt ein.<br>Konj: kaufe ein, kaufst ein, kauft ein...", 
          imp: "kauf ein / kaufen Sie ein" 
        },
        { 
          inf: "mitbringen", 
          notes: "Bsp: Ich bringe einen Kuchen mit.<br>Konj: bringe mit, bringst mit, bringt mit...", 
          imp: "bring mit / bringen Sie mit" 
        }
      ]
    },
    lesetexte: [
        {
            title: "Text 1: Hallo! Ich bin Anna",
            fokus: "Fokus: Begrüßung, sich vorstellen, Zahlen, Hobbys",
            text: "Hallo! Ich bin Anna und ich bin 25 Jahre alt. Ich komme aus Österreich, aber ich wohne jetzt in Berlin. Berlin ist eine große und schöne Stadt. Ich lerne Deutsch, weil ich hier arbeiten möchte. Meine Hobbys sind Lesen und Schwimmen. Am Wochenende fahre ich oft mit dem Fahrrad. Ich habe einen Bruder. Er heißt Lukas und ist 22 Jahre alt."
        },
        {
            title: "Text 2: Im Supermarkt",
            fokus: "Fokus: Einkaufen, Essen, Fragen stellen",
            text: "Heute ist Samstag. Ich gehe in den Supermarkt, denn mein Kühlschrank ist leer. Zuerst brauche ich Obst. Ich kaufe fünf Äpfel und drei Bananen. Dann gehe ich zur Bäckerei und kaufe ein frisches Brot. Ich suche die Milch, aber ich finde sie nicht. Ich frage eine Verkäuferin: „Entschuldigung, wo ist die Milch?“ Sie antwortet: „Die Milch ist im Gang vier, links.“ Ich bedanke mich und bezahle an der Kasse."
        },
        {
            title: "Text 3: Ein Ausflug nach München",
            fokus: "Fokus: Präteritum (war, hatte), Perfekt",
            text: "Letztes Wochenende war ich in München. Das Wetter war sehr schön – die Sonne hat geschienen und es war warm. Ich bin mit dem Zug gefahren. Die Fahrt hat zwei Stunden gedauert. In München habe ich meine Freundin Sarah besucht. Wir haben zusammen das Zentrum gesehen und einen Kaffee getrunken. Am Abend haben wir in einem Restaurant typisch bayerisch gegessen. Es war sehr lecker!"
        },
        {
            title: "Text 4: Der Alltag im Büro",
            fokus: "Fokus: Büro, Zeit, Modalverben (können, müssen, wollen)",
            text: "Guten Morgen! Mein Name ist Herr Schmidt. Ich arbeite in einem Büro in Berlin. Mein Tag beginnt immer früh. Ich stehe um sechs Uhr auf, dusche kalt und trinke einen starken Kaffee. Ich fahre jeden Tag mit dem Fahrrad zur Arbeit. Zuerst schalte ich meinen Computer an und lese meine E-Mails. Heute habe ich sehr viel Arbeit. Ich muss zwei Berichte schreiben und drei Kunden anrufen. Um zwölf Uhr mache ich eine Pause."
        }
    ]
};