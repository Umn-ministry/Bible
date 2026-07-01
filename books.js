/**
 * Tamil Bible Reader PWA - Books Metadata Array
 * Contains structural identifiers, Tamil localized translations, and chapter limits
 * for all 66 canonical books divided strictly by testaments.
 */
const BIBLE_BOOKS_METADATA = [
    // --- OLD TESTAMENT (பழைய ஏற்பாடு) ---
    { id: "Genesis", ta: "ஆதியாகமம்", chapters: 50, testament: "OT" },
    { id: "Exodus", ta: "யாத்திராகமம்", chapters: 40, testament: "OT" },
    { id: "Leviticus", ta: "லேவியராகமம்", chapters: 27, testament: "OT" },
    { id: "Numbers", ta: "எண்ணாகமம்", chapters: 36, testament: "OT" },
    { id: "Deuteronomy", ta: "உபாகமம்", chapters: 34, testament: "OT" },
    { id: "Joshua", ta: "யோசுவா", chapters: 24, testament: "OT" },
    { id: "Judges", ta: "நியாயாதிபதிகள்", chapters: 21, testament: "OT" },
    { id: "Ruth", ta: "ரூத்", chapters: 4, testament: "OT" },
    { id: "1 Samuel", ta: "1 சாமுவேல்", chapters: 31, testament: "OT" },
    { id: "2 Samuel", ta: "2 சாமுவேல்", chapters: 24, testament: "OT" },
    { id: "1 Kings", ta: "1 இராஜாக்கள்", chapters: 22, testament: "OT" },
    { id: "2 Kings", ta: "2 இராஜாக்கள்", chapters: 25, testament: "OT" },
    { id: "1 Chronicles", ta: "1 நாளாகமம்", chapters: 29, testament: "OT" },
    { id: "2 Chronicles", ta: "2 நாளாகமம்", chapters: 36, testament: "OT" },
    { id: "Ezra", ta: "எஸ்றா", chapters: 10, testament: "OT" },
    { id: "Nehemiah", ta: "நெகேமியா", chapters: 13, testament: "OT" },
    { id: "Esther", ta: "எஸ்தர்", chapters: 10, testament: "OT" },
    { id: "Job", ta: "யோபு", chapters: 42, testament: "OT" },
    { id: "Psalms", ta: "சங்கீதம்", chapters: 150, testament: "OT" },
    { id: "Proverbs", ta: "நீதிமொழிகள்", chapters: 31, testament: "OT" },
    { id: "Ecclesiastes", ta: "பிரசங்கி", chapters: 12, testament: "OT" },
    { id: "Song of Solomon", ta: "உன்னதப்பாட்டு", chapters: 8, testament: "OT" },
    { id: "Isaiah", ta: "ஏசாயா", chapters: 66, testament: "OT" },
    { id: "Jeremiah", ta: "எரேமியா", chapters: 52, testament: "OT" },
    { id: "Lamentations", ta: "புலம்பல்", chapters: 5, testament: "OT" },
    { id: "Ezekiel", ta: "எசேக்கியேல்", chapters: 48, testament: "OT" },
    { id: "Daniel", ta: "தானியேல்", chapters: 12, testament: "OT" },
    { id: "Hosea", ta: "ஓசியா", chapters: 14, testament: "OT" },
    { id: "Joel", ta: "யோவேல்", chapters: 3, testament: "OT" },
    { id: "Amos", ta: "ஆமோஸ்", chapters: 9, testament: "OT" },
    { id: "Obadiah", ta: "ஒபதியா", chapters: 1, testament: "OT" },
    { id: "Jonah", ta: "யோனா", chapters: 4, testament: "OT" },
    { id: "Micah", ta: "மீகா", chapters: 7, testament: "OT" },
    { id: "Nahum", ta: "நாகூம்", chapters: 3, testament: "OT" },
    { id: "Habakkuk", ta: "ஆபகூக்", chapters: 3, testament: "OT" },
    { id: "Zephaniah", ta: "செப்பனியா", chapters: 3, testament: "OT" },
    { id: "Haggai", ta: "ஆகாய்", chapters: 2, testament: "OT" },
    { id: "Zechariah", ta: "சகரியா", chapters: 14, testament: "OT" },
    { id: "Malachi", ta: "மல்கியா", chapters: 4, testament: "OT" },

    // --- NEW TESTAMENT (புதிய ஏற்பாடு) ---
    { id: "Matthew", ta: "மத்தேயு", chapters: 28, testament: "NT" },
    { id: "Mark", ta: "மாற்கு", chapters: 16, testament: "NT" },
    { id: "Luke", ta: "லூக்கா", chapters: 24, testament: "NT" },
    { id: "John", ta: "யோவான்", chapters: 21, testament: "NT" },
    { id: "Acts", ta: "அப்போஸ்தலர் நடபடிகள்", chapters: 28, testament: "NT" },
    { id: "Romans", ta: "ரோமர்", chapters: 16, testament: "NT" },
    { id: "1 Corinthians", ta: "1 கொரிந்தியர்", chapters: 16, testament: "NT" },
    { id: "2 Corinthians", ta: "2 கொரிந்தியர்", chapters: 13, testament: "NT" },
    { id: "Galatians", ta: "கலாத்தியர்", chapters: 6, testament: "NT" },
    { id: "Ephesians", ta: "எபேசியர்", chapters: 6, testament: "NT" },
    { id: "Philippians", ta: "பிலிப்பியர்", chapters: 4, testament: "NT" },
    { id: "Colossians", ta: "கொலோசெயர்", chapters: 4, testament: "NT" },
    { id: "1 Thessalonians", ta: "1 தெசலோனிக்கேயர்", chapters: 5, testament: "NT" },
    { id: "2 Thessalonians", ta: "2 தெசலோனிக்கேயர்", chapters: 3, testament: "NT" },
    { id: "1 Timothy", ta: "1 தீமோத்தேயு", chapters: 6, testament: "NT" },
    { id: "2 Timothy", ta: "2 தீமோத்தேயு", chapters: 4, testament: "NT" },
    { id: "Titus", ta: "தீத்து", chapters: 3, testament: "NT" },
    { id: "Philemon", ta: "பிலேமோன்", chapters: 1, testament: "NT" },
    { id: "Hebrews", ta: "எபிரெயர்", chapters: 13, testament: "NT" },
    { id: "James", ta: "யாக்கோபு", chapters: 5, testament: "NT" },
    { id: "1 Peter", ta: "1 பேதுரு", chapters: 5, testament: "NT" },
    { id: "2 Peter", ta: "2 பேதுரு", chapters: 3, testament: "NT" },
    { id: "1 John", ta: "1 யோவான்", chapters: 5, testament: "NT" },
    { id: "2 John", ta: "2 யோவான்", chapters: 1, testament: "NT" },
    { id: "3 John", ta: "3 யோவான்", chapters: 1, testament: "NT" },
    { id: "Jude", ta: "யூதா", chapters: 1, testament: "NT" },
    { id: "Revelation", ta: "வெளிப்படுத்தின விசேஷம்", chapters: 22, testament: "NT" }
];

/**
 * Utility helper to retrieve a specific book configuration by its unique ID
 * @param {string} id - The English ID string of the target book
 * @returns {object|undefined} The targeted metadata configuration object
 */
function getBookMetadataById(id) {
    return BIBLE_BOOKS_METADATA.find(book => book.id.toLowerCase() === id.toLowerCase());
}
