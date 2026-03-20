// data.js - Holds all vocabulary and reading content
const materialData = {
    nomen: {
      title: "Wichtige Nomen (A1-A2)",
      description: "Eine Liste der wichtigsten Nomen mit ihrem Artikel und der Pluralform.",
      headers: ["Wort (Singular)", "Plural"],
      items: [
        { wort: "das Haus", plural: "die Häuser" },
        { wort: "das Auto", plural: "die Autos" },
        { wort: "der Baum", plural: "die Bäume" },
        { wort: "die Frau", plural: "die Frauen" },
        { wort: "der Mann", plural: "die Männer" },
        { wort: "das Kind", plural: "die Kinder" },
        { wort: "die Stadt", plural: "die Städte" },
        { wort: "der Tisch", plural: "die Tische" },
        { wort: "das Buch", plural: "die Bücher" },
        { wort: "der Apfel", plural: "die Äpfel" }
      ]
    },
    adjektive: {
      title: "Wichtige Adjektive (A1-A2)",
      description: "Adjektive und ihre Steigerungsformen (Komparativ & Superlativ).",
      headers: ["Positiv (Grundform)", "Komparativ", "Superlativ"],
      items: [
        { positiv: "gut", komparativ: "besser", superlativ: "am besten" },
        { positiv: "viel", komparativ: "mehr", superlativ: "am meisten" },
        { positiv: "groß", komparativ: "größer", superlativ: "am größten" },
        { positiv: "klein", komparativ: "kleiner", superlativ: "am kleinsten" },
        { positiv: "schnell", komparativ: "schneller", superlativ: "am schnellsten" },
        { positiv: "alt", komparativ: "älter", superlativ: "am ältesten" },
        { positiv: "schön", komparativ: "schöner", superlativ: "am schönsten" },
        { positiv: "teuer", komparativ: "teurer", superlativ: "am teuersten" }
      ]
    },
    verben: {
      title: "Wichtige Verben (A1-A2)",
      description: "Verben in der Grundform, im Präteritum und im Perfekt.",
      headers: ["Infinitiv", "Präteritum", "Perfekt"],
      items: [
        { infinitiv: "sein", praeteritum: "war", perfekt: "ist gewesen" },
        { infinitiv: "haben", praeteritum: "hatte", perfekt: "hat gehabt" },
        { infinitiv: "gehen", praeteritum: "ging", perfekt: "ist gegangen" },
        { infinitiv: "machen", praeteritum: "machte", perfekt: "hat gemacht" },
        { infinitiv: "sehen", praeteritum: "sah", perfekt: "hat gesehen" },
        { infinitiv: "sprechen", praeteritum: "sprach", perfekt: "hat gesprochen" },
        { infinitiv: "fahren", praeteritum: "fuhr", perfekt: "ist gefahren" },
        { infinitiv: "lesen", praeteritum: "las", perfekt: "hat gelesen" },
        { infinitiv: "essen", praeteritum: "aß", perfekt: "hat gegessen" },
        { infinitiv: "trinken", praeteritum: "trank", perfekt: "hat getrunken" }
      ]
    },
    lesetexte: [
        {
            title: "Mein Wochenende",
            text: "Am Wochenende habe ich viel Zeit. Am Samstag schlafe ich lange. Danach frühstücke ich mit meiner Familie. Wir essen Brötchen, trinken Kaffee und lesen die Zeitung. Am Nachmittag gehe ich oft mit dem Hund im Park spazieren. Das Wetter ist meistens schön. Am Abend koche ich Pasta oder wir bestellen eine Pizza. Am Sonntag treffe ich oft Freunde oder ich lese ein gutes Buch. Das Wochenende ist immer sehr entspannend!"
        }
    ]
};