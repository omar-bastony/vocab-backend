// ==========================================
// DAILY GRAMMAR TIPS
// ==========================================
const dailyTips = [
    "Nomen werden im Deutschen immer großgeschrieben! (z.B. der <b>A</b>pfel, das <b>A</b>uto)",
    "Verben auf '-en' enden in der 'ich'-Form meist auf '-e' (ich spiel<b>e</b>, ich lach<b>e</b>).",
    "Das Verb 'sein' ist unregelmäßig: ich bin, du bist, er/sie/es ist, wir sind, ihr seid, sie sind.",
    "Fragesätze beginnen oft mit dem Verb: <b>Gehst</b> du nach Hause?",
    "Nach den Verben 'helfen', 'danken' und 'gefallen' steht immer der <b>Dativ</b>!",
    "Adjektive stehen vor dem Nomen und passen sich an (ein <b>großer</b> Hund).",
    "Zusammengesetzte Nomen haben den Artikel des letzten Wortes (das Haus + die Tür = <b>die Haustür</b>).",
    "Der Plural von Nomen ist oft unregelmäßig. Lerne ihn direkt mit! (der Apfel -> die <b>Äpfel</b>)"
];


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

// ==========================================
// --- A1 & A2 GERMAN GRAMMAR LIBRARY ---
// ==========================================
const grammarContent = {
    pronomen: {
      title: "Pronomen, sein, haben & Possessiv",
      body: `
        <p>Die wichtigsten Verben und Begleiter auf Deutsch. Die Verben <strong>sein</strong> und <strong>haben</strong> sind unregelmäßig.</p>
        <table class="grammar-table">
          <thead>
            <tr>
              <th>Pronomen</th>
              <th>sein (to be)</th>
              <th>haben (to have)</th>
              <th>Possessiv (my, your...)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>ich</strong></td><td>bin</td><td>habe</td><td>mein / meine</td></tr>
            <tr><td><strong>du</strong></td><td>bist</td><td>hast</td><td>dein / deine</td></tr>
            <tr><td><strong>er/sie/es</strong></td><td>ist</td><td>hat</td><td>sein / ihr / sein</td></tr>
            <tr><td><strong>wir</strong></td><td>sind</td><td>haben</td><td>unser / unsere</td></tr>
            <tr><td><strong>ihr</strong></td><td>seid</td><td>habt</td><td>euer / eure</td></tr>
            <tr><td><strong>sie/Sie</strong></td><td>sind</td><td>haben</td><td>ihr / Ihr</td></tr>
          </tbody>
        </table>
        <p><em>Beispiel:</em> <span class="grammar-highlight">Ich bin</span> müde, aber <span class="grammar-highlight">ich habe</span> mein Buch.</p>
      `
    },
    kasus: {
      title: "Artikel & Kasus (Fälle)",
      body: `
        <p>Der Artikel ändert sich, je nachdem welche Funktion das Nomen im Satz hat.</p>
        <ul>
          <li><strong>Nominativ:</strong> Das Subjekt. <em>(Wer oder was?)</em></li>
          <li><strong>Akkusativ:</strong> Das direkte Objekt. <em>(Wen oder was?)</em></li>
          <li><strong>Dativ:</strong> Das indirekte Objekt. <em>(Wem?)</em></li>
        </ul>
        <table class="grammar-table">
          <thead>
            <tr>
              <th>Kasus</th>
              <th>Maskulin (der)</th>
              <th>Feminin (die)</th>
              <th>Neutral (das)</th>
              <th>Plural (die)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Nominativ</strong></td><td>der</td><td>die</td><td>das</td><td>die</td></tr>
            <tr><td><strong>Akkusativ</strong></td><td><span class="grammar-highlight">den</span></td><td>die</td><td>das</td><td>die</td></tr>
            <tr><td><strong>Dativ</strong></td><td><span class="grammar-highlight">dem</span></td><td><span class="grammar-highlight">der</span></td><td><span class="grammar-highlight">dem</span></td><td><span class="grammar-highlight">den (+n)</span></td></tr>
          </tbody>
        </table>
        <p><em>Beispiel:</em> <span class="grammar-highlight">Der Mann</span> (Nom) gibt <span class="grammar-highlight">dem Kind</span> (Dat) <span class="grammar-highlight">den Apfel</span> (Akk).</p>
      `
    },
    fragen: {
      title: "Fragen stellen",
      body: `
        <p>Es gibt zwei Hauptarten von Fragen auf Deutsch:</p>
        <p><strong>1. W-Fragen (Information)</strong><br>
        Das Fragewort steht auf Position 1, das Verb auf Position 2.</p>
        <ul>
          <li><strong>Wer?</strong> (Person): <em>Wer ist das?</em></li>
          <li><strong>Was?</strong> (Sache): <em>Was machst du?</em></li>
          <li><strong>Wo? / Wohin?</strong> (Ort): <em>Wo wohnst du? Wohin gehst du?</em></li>
          <li><strong>Wann?</strong> (Zeit): <em>Wann kommt der Zug?</em></li>
        </ul>
        <p><strong>2. Ja/Nein-Fragen</strong><br>
        Das Verb steht auf Position 1!</p>
        <ul>
          <li><em><span class="grammar-highlight">Lernst</span> du Deutsch?</em> – Ja, ich lerne Deutsch.</li>
          <li><em><span class="grammar-highlight">Hast</span> du Zeit?</em> – Nein, leider nicht.</li>
        </ul>
      `
    },
    perfekt: {
      title: "Das Perfekt (Vergangenheit)",
      body: `
        <p>Wir benutzen das Perfekt für die Vergangenheit, besonders wenn wir sprechen.</p>
        <p><strong>Die Regel:</strong> <span class="grammar-highlight">haben</span> oder <span class="grammar-highlight">sein</span> (Position 2) + <strong>Partizip II</strong> (am Ende des Satzes).</p>
        <p>Wann benutzt man <strong>sein</strong>?</p>
        <ul>
          <li>Bei Bewegung von A nach B: <em>gehen, fahren, fliegen, kommen.</em></li>
          <li>Bei Zustandsänderung: <em>aufwachen, einschlafen, sterben.</em></li>
          <li>Ausnahmen: <em>sein, bleiben, passieren.</em></li>
        </ul>
        <p><strong>Beispiele:</strong></p>
        <ul>
          <li>(haben): <em>Ich <span class="grammar-highlight">habe</span> gestern eine Pizza <span class="grammar-highlight">gegessen</span>.</em></li>
          <li>(sein): <em>Wir <span class="grammar-highlight">sind</span> am Wochenende nach Berlin <span class="grammar-highlight">gefahren</span>.</em></li>
        </ul>
      `
    },
    praeteritum: {
      title: "Das Präteritum (Vergangenheit)",
      body: `
        <p>Das Präteritum wird oft in Texten (Büchern, Zeitungen) benutzt. Im A2-Niveau ist es besonders wichtig für <strong>haben</strong>, <strong>sein</strong> und die <strong>Modalverben</strong>.</p>
        <table class="grammar-table">
          <thead>
            <tr>
              <th>Pronomen</th>
              <th>sein (war)</th>
              <th>haben (hatte)</th>
              <th>müssen (musste)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>ich</strong></td><td>war</td><td>hatte</td><td>musste</td></tr>
            <tr><td><strong>du</strong></td><td>warst</td><td>hattest</td><td>musstest</td></tr>
            <tr><td><strong>er/sie/es</strong></td><td>war</td><td>hatte</td><td>musste</td></tr>
            <tr><td><strong>wir</strong></td><td>waren</td><td>hatten</td><td>mussten</td></tr>
          </tbody>
        </table>
        <p><strong>Beispiele:</strong></p>
        <ul>
          <li><em>Ich <span class="grammar-highlight">war</span> gestern krank.</em></li>
          <li><em>Als Kind <span class="grammar-highlight">hatte</span> ich einen Hund.</em></li>
          <li><em>Er <span class="grammar-highlight">musste</span> lange arbeiten.</em></li>
        </ul>
      `
    },
    nebensaetze: {
      title: "Nebensätze (dass, weil, wenn)",
      body: `
        <p>In einem Nebensatz steht das konjugierte Verb <strong>immer ganz am Ende</strong>.</p>
        <ul>
          <li><strong>weil (Grund/Warum?):</strong><br> 
          <em>Ich lerne Deutsch, <span class="grammar-highlight">weil</span> ich in Deutschland leben <span class="grammar-highlight">möchte</span>.</em></li>
          <li><strong>dass (Information):</strong><br> 
          <em>Ich glaube, <span class="grammar-highlight">dass</span> die deutsche Grammatik schwer <span class="grammar-highlight">ist</span>.</em></li>
          <li><strong>wenn (Bedingung):</strong><br> 
          <em><span class="grammar-highlight">Wenn</span> das Wetter schön <span class="grammar-highlight">ist</span>, gehe ich spazieren.</em></li>
        </ul>
        <p><em>Wichtig:</em> Wenn der Satz mit dem Nebensatz beginnt (wie bei "wenn"), steht das Verb des Hauptsatzes direkt danach auf Position 1! (<em>...ist, <strong>gehe</strong> ich...</em>)</p>
      `
    },
    wechselpraep: {
      title: "Wechselpräpositionen",
      body: `
        <p>Diese Präpositionen können mit Dativ oder Akkusativ stehen: <br>
        <strong>in, an, auf, neben, hinter, über, unter, vor, zwischen</strong>.</p>
        <p><strong>1. Akkusativ (Wohin?) – Bewegung/Aktion</strong></p>
        <ul>
          <li>Aktion: Ich bewege etwas von A nach B.</li>
          <li><em>Ich stelle die Tasse <span class="grammar-highlight">auf den</span> Tisch.</em></li>
        </ul>
        <p><strong>2. Dativ (Wo?) – Position/Stillstand</strong></p>
        <ul>
          <li>Position: Etwas ist schon dort, es bewegt sich nicht.</li>
          <li><em>Die Tasse steht <span class="grammar-highlight">auf dem</span> Tisch.</em></li>
        </ul>
      `
    },
    komparativ: {
      title: "Komparativ & Superlativ",
      body: `
        <p>Wir benutzen dies, um Dinge oder Personen zu vergleichen.</p>
        <table class="grammar-table">
          <thead>
            <tr>
              <th>Grundform</th>
              <th>Komparativ (+er)</th>
              <th>Superlativ (am ...-sten)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>schnell</td><td>schnell<span class="grammar-highlight">er</span></td><td><span class="grammar-highlight">am</span> schnell<span class="grammar-highlight">sten</span></td></tr>
            <tr><td>alt (Umlaut)</td><td><span class="grammar-highlight">ä</span>lt<span class="grammar-highlight">er</span></td><td><span class="grammar-highlight">am ä</span>lte<span class="grammar-highlight">sten</span></td></tr>
            <tr><td>gut (Irregulär)</td><td><span class="grammar-highlight">besser</span></td><td><span class="grammar-highlight">am besten</span></td></tr>
            <tr><td>viel (Irregulär)</td><td><span class="grammar-highlight">mehr</span></td><td><span class="grammar-highlight">am meisten</span></td></tr>
          </tbody>
        </table>
        <p><strong>Beispiele:</strong></p>
        <ul>
          <li>Gleich: <em>Maria ist so groß <span class="grammar-highlight">wie</span> Anna.</em></li>
          <li>Unterschied: <em>Peter ist größ<span class="grammar-highlight">er als</span> Maria.</em></li>
          <li>Höchste Stufe: <em>Tom ist <span class="grammar-highlight">am größten</span>.</em></li>
        </ul>
      `
    }
};