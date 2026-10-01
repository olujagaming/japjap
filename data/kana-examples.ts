/**
 * Beispielwörter je Kana. Jedes Wort enthält das Zeichen in seiner Lesung
 * (für Katakana: im Wort selbst). Romaji in Hepburn mit Längenstrichen.
 */
export type KanaExample = {
  japanese: string;
  reading: string;
  romaji: string;
  german: string;
};

type Ex = readonly [japanese: string, reading: string, romaji: string, german: string];

const RAW: Record<string, readonly Ex[]> = {
  // ---------- Hiragana: Grundzeichen ----------
  あ: [
    ["雨", "あめ", "ame", "Regen"],
    ["朝", "あさ", "asa", "Morgen"],
  ],
  い: [
    ["犬", "いぬ", "inu", "Hund"],
    ["家", "いえ", "ie", "Haus, Zuhause"],
  ],
  う: [
    ["海", "うみ", "umi", "Meer"],
    ["歌", "うた", "uta", "Lied"],
  ],
  え: [
    ["駅", "えき", "eki", "Bahnhof"],
    ["絵", "え", "e", "Bild, Gemälde"],
  ],
  お: [
    ["お茶", "おちゃ", "ocha", "(grüner) Tee"],
    ["音", "おと", "oto", "Geräusch, Klang"],
  ],
  か: [
    ["傘", "かさ", "kasa", "Regenschirm"],
    ["顔", "かお", "kao", "Gesicht"],
  ],
  き: [
    ["北", "きた", "kita", "Norden"],
    ["着物", "きもの", "kimono", "Kimono"],
  ],
  く: [
    ["車", "くるま", "kuruma", "Auto"],
    ["口", "くち", "kuchi", "Mund"],
  ],
  け: [
    ["今朝", "けさ", "kesa", "heute Morgen"],
    ["毛", "け", "ke", "Haar (am Körper), Fell"],
  ],
  こ: [
    ["声", "こえ", "koe", "Stimme"],
    ["子供", "こども", "kodomo", "Kind"],
  ],
  さ: [
    ["魚", "さかな", "sakana", "Fisch"],
    ["桜", "さくら", "sakura", "Kirschblüte"],
  ],
  し: [
    ["島", "しま", "shima", "Insel"],
    ["塩", "しお", "shio", "Salz"],
  ],
  す: [
    ["寿司", "すし", "sushi", "Sushi"],
    ["好き", "すき", "suki", "mögen, gern haben"],
  ],
  せ: [
    ["先生", "せんせい", "sensei", "Lehrer, Lehrerin"],
    ["世界", "せかい", "sekai", "Welt"],
  ],
  そ: [
    ["空", "そら", "sora", "Himmel"],
    ["外", "そと", "soto", "draußen"],
  ],
  た: [
    ["卵", "たまご", "tamago", "Ei"],
    ["高い", "たかい", "takai", "teuer; hoch"],
  ],
  ち: [
    ["地図", "ちず", "chizu", "Landkarte"],
    ["近い", "ちかい", "chikai", "nah"],
  ],
  つ: [
    ["月", "つき", "tsuki", "Mond; Monat"],
    ["机", "つくえ", "tsukue", "Schreibtisch"],
  ],
  て: [
    ["手", "て", "te", "Hand"],
    ["手紙", "てがみ", "tegami", "Brief"],
  ],
  と: [
    ["時計", "とけい", "tokei", "Uhr"],
    ["友達", "ともだち", "tomodachi", "Freund, Freundin"],
  ],
  な: [
    ["夏", "なつ", "natsu", "Sommer"],
    ["名前", "なまえ", "namae", "Name"],
  ],
  に: [
    ["肉", "にく", "niku", "Fleisch"],
    ["日本", "にほん", "nihon", "Japan"],
  ],
  ぬ: [
    ["布", "ぬの", "nuno", "Stoff, Tuch"],
    ["犬", "いぬ", "inu", "Hund"],
  ],
  ね: [
    ["猫", "ねこ", "neko", "Katze"],
    ["熱", "ねつ", "netsu", "Fieber"],
  ],
  の: [
    ["飲み物", "のみもの", "nomimono", "Getränk"],
    ["喉", "のど", "nodo", "Hals, Kehle"],
  ],
  は: [
    ["花", "はな", "hana", "Blume"],
    ["箸", "はし", "hashi", "Essstäbchen"],
  ],
  ひ: [
    ["人", "ひと", "hito", "Mensch, Person"],
    ["左", "ひだり", "hidari", "links"],
  ],
  ふ: [
    ["冬", "ふゆ", "fuyu", "Winter"],
    ["船", "ふね", "fune", "Schiff"],
  ],
  へ: [
    ["部屋", "へや", "heya", "Zimmer"],
    ["下手", "へた", "heta", "ungeschickt, schlecht in etwas"],
  ],
  ほ: [
    ["本", "ほん", "hon", "Buch"],
    ["星", "ほし", "hoshi", "Stern"],
  ],
  ま: [
    ["町", "まち", "machi", "Stadt, Stadtviertel"],
    ["窓", "まど", "mado", "Fenster"],
  ],
  み: [
    ["水", "みず", "mizu", "Wasser"],
    ["耳", "みみ", "mimi", "Ohr"],
  ],
  む: [
    ["虫", "むし", "mushi", "Insekt"],
    ["村", "むら", "mura", "Dorf"],
  ],
  め: [
    ["目", "め", "me", "Auge"],
    ["眼鏡", "めがね", "megane", "Brille"],
  ],
  も: [
    ["桃", "もも", "momo", "Pfirsich"],
    ["森", "もり", "mori", "Wald"],
  ],
  や: [
    ["山", "やま", "yama", "Berg"],
    ["野菜", "やさい", "yasai", "Gemüse"],
  ],
  ゆ: [
    ["雪", "ゆき", "yuki", "Schnee"],
    ["指", "ゆび", "yubi", "Finger"],
  ],
  よ: [
    ["夜", "よる", "yoru", "Abend, Nacht"],
    ["予約", "よやく", "yoyaku", "Reservierung"],
  ],
  ら: [
    ["来年", "らいねん", "rainen", "nächstes Jahr"],
    ["楽", "らく", "raku", "bequem, leicht"],
  ],
  り: [
    ["りんご", "りんご", "ringo", "Apfel"],
    ["理由", "りゆう", "riyū", "Grund"],
  ],
  る: [
    ["春", "はる", "haru", "Frühling"],
    ["留守", "るす", "rusu", "nicht zu Hause, abwesend"],
  ],
  れ: [
    ["冷蔵庫", "れいぞうこ", "reizōko", "Kühlschrank"],
    ["歴史", "れきし", "rekishi", "Geschichte"],
  ],
  ろ: [
    ["六", "ろく", "roku", "sechs"],
    ["廊下", "ろうか", "rōka", "Flur, Gang"],
  ],
  わ: [
    ["私", "わたし", "watashi", "ich"],
    ["笑う", "わらう", "warau", "lachen"],
  ],
  を: [
    ["水を飲む", "みずをのむ", "mizu o nomu", "Wasser trinken"],
    ["本を読む", "ほんをよむ", "hon o yomu", "ein Buch lesen"],
  ],
  ん: [
    ["本", "ほん", "hon", "Buch"],
    ["電話", "でんわ", "denwa", "Telefon"],
  ],

  // ---------- Hiragana: Dakuten / Handakuten ----------
  が: [["学校", "がっこう", "gakkō", "Schule"]],
  ぎ: [["銀行", "ぎんこう", "ginkō", "Bank"]],
  ぐ: [["具合", "ぐあい", "guai", "Befinden, Zustand"]],
  げ: [["元気", "げんき", "genki", "gesund, munter"]],
  ご: [["ご飯", "ごはん", "gohan", "Reis; Mahlzeit"]],
  ざ: [["雑誌", "ざっし", "zasshi", "Zeitschrift"]],
  じ: [["時間", "じかん", "jikan", "Zeit"]],
  ず: [["地図", "ちず", "chizu", "Landkarte"]],
  ぜ: [["全部", "ぜんぶ", "zenbu", "alles"]],
  ぞ: [["象", "ぞう", "zō", "Elefant"]],
  だ: [["大学", "だいがく", "daigaku", "Universität"]],
  ぢ: [["鼻血", "はなぢ", "hanaji", "Nasenbluten"]],
  づ: [["続く", "つづく", "tsuzuku", "weitergehen, andauern"]],
  で: [["電車", "でんしゃ", "densha", "Zug, Bahn"]],
  ど: [["土曜日", "どようび", "doyōbi", "Samstag"]],
  ば: [["晩ご飯", "ばんごはん", "bangohan", "Abendessen"]],
  び: [["美術館", "びじゅつかん", "bijutsukan", "Kunstmuseum"]],
  ぶ: [["豚肉", "ぶたにく", "butaniku", "Schweinefleisch"]],
  べ: [["勉強", "べんきょう", "benkyō", "Lernen"]],
  ぼ: [["帽子", "ぼうし", "bōshi", "Hut, Mütze"]],
  ぱ: [["乾杯", "かんぱい", "kanpai", "Prost!"]],
  ぴ: [["鉛筆", "えんぴつ", "enpitsu", "Bleistift"]],
  ぷ: [["天ぷら", "てんぷら", "tenpura", "Tempura"]],
  ぺ: [["ぺこぺこ", "ぺこぺこ", "pekopeko", "(sehr) hungrig"]],
  ぽ: [["散歩", "さんぽ", "sanpo", "Spaziergang"]],

  // ---------- Hiragana: Yōon ----------
  きゃ: [["客", "きゃく", "kyaku", "Gast, Kunde"]],
  きゅ: [["九", "きゅう", "kyū", "neun"]],
  きょ: [["今日", "きょう", "kyō", "heute"]],
  しゃ: [["写真", "しゃしん", "shashin", "Foto"]],
  しゅ: [["宿題", "しゅくだい", "shukudai", "Hausaufgabe"]],
  しょ: [["醤油", "しょうゆ", "shōyu", "Sojasoße"]],
  ちゃ: [["お茶", "おちゃ", "ocha", "(grüner) Tee"]],
  ちゅ: [["中学校", "ちゅうがっこう", "chūgakkō", "Mittelschule"]],
  ちょ: [["ちょっと", "ちょっと", "chotto", "ein bisschen; Moment mal"]],
  にゃ: [["こんにゃく", "こんにゃく", "konnyaku", "Konjak (Teufelszunge)"]],
  にゅ: [["牛乳", "ぎゅうにゅう", "gyūnyū", "Milch"]],
  にょ: [["にょろにょろ", "にょろにょろ", "nyoronyoro", "sich schlängelnd"]],
  ひゃ: [["百", "ひゃく", "hyaku", "hundert"]],
  ひゅ: [["ひゅうひゅう", "ひゅうひゅう", "hyūhyū", "(Wind) pfeifend"]],
  ひょ: [["表", "ひょう", "hyō", "Tabelle"]],
  みゃ: [["脈", "みゃく", "myaku", "Puls"]],
  みょ: [["名字", "みょうじ", "myōji", "Familienname"]],
  りゃ: [["略", "りゃく", "ryaku", "Abkürzung"]],
  りゅ: [["留学", "りゅうがく", "ryūgaku", "Auslandsstudium"]],
  りょ: [["旅行", "りょこう", "ryokō", "Reise"]],
  ぎゃ: [["逆", "ぎゃく", "gyaku", "Gegenteil"]],
  ぎゅ: [["牛肉", "ぎゅうにく", "gyūniku", "Rindfleisch"]],
  ぎょ: [["金魚", "きんぎょ", "kingyo", "Goldfisch"]],
  じゃ: [["じゃあね", "じゃあね", "jā ne", "Tschüss!"]],
  じゅ: [["十", "じゅう", "jū", "zehn"]],
  じょ: [["女性", "じょせい", "josei", "Frau"]],
  びょ: [["病院", "びょういん", "byōin", "Krankenhaus"]],
  ぴゃ: [["八百", "はっぴゃく", "happyaku", "achthundert"]],
  ぴょ: [["ぴょんぴょん", "ぴょんぴょん", "pyonpyon", "hüpfend"]],

  // ---------- Katakana: Grundzeichen ----------
  ア: [
    ["アイス", "アイス", "aisu", "Eis (Speiseeis)"],
    ["アメリカ", "アメリカ", "Amerika", "Amerika, USA"],
  ],
  イ: [
    ["イギリス", "イギリス", "Igirisu", "Großbritannien"],
    ["イヤホン", "イヤホン", "iyahon", "Kopfhörer (In-Ear)"],
  ],
  ウ: [["ウイスキー", "ウイスキー", "uisukī", "Whisky"]],
  エ: [
    ["エアコン", "エアコン", "eakon", "Klimaanlage"],
    ["エレベーター", "エレベーター", "erebētā", "Aufzug"],
  ],
  オ: [["オレンジ", "オレンジ", "orenji", "Orange"]],
  カ: [
    ["カメラ", "カメラ", "kamera", "Kamera"],
    ["カード", "カード", "kādo", "Karte"],
  ],
  キ: [
    ["キッチン", "キッチン", "kitchin", "Küche"],
    ["キロ", "キロ", "kiro", "Kilo(meter/gramm)"],
  ],
  ク: [
    ["クラス", "クラス", "kurasu", "(Schul-)Klasse"],
    ["クッキー", "クッキー", "kukkī", "Keks"],
  ],
  ケ: [["ケーキ", "ケーキ", "kēki", "Kuchen, Torte"]],
  コ: [
    ["コーヒー", "コーヒー", "kōhī", "Kaffee"],
    ["コンビニ", "コンビニ", "konbini", "Convenience Store, Späti"],
  ],
  サ: [
    ["サラダ", "サラダ", "sarada", "Salat"],
    ["サッカー", "サッカー", "sakkā", "Fußball"],
  ],
  シ: [
    ["シール", "シール", "shīru", "Aufkleber"],
    ["タクシー", "タクシー", "takushī", "Taxi"],
  ],
  ス: [
    ["スープ", "スープ", "sūpu", "Suppe"],
    ["スマホ", "スマホ", "sumaho", "Smartphone"],
  ],
  セ: [
    ["セーター", "セーター", "sētā", "Pullover"],
    ["セット", "セット", "setto", "Set, Menü"],
  ],
  ソ: [
    ["ソース", "ソース", "sōsu", "Soße"],
    ["ソファ", "ソファ", "sofa", "Sofa"],
  ],
  タ: [
    ["タクシー", "タクシー", "takushī", "Taxi"],
    ["タオル", "タオル", "taoru", "Handtuch"],
  ],
  チ: [
    ["チーズ", "チーズ", "chīzu", "Käse"],
    ["チケット", "チケット", "chiketto", "Ticket, Eintrittskarte"],
  ],
  ツ: [
    ["ツアー", "ツアー", "tsuā", "Tour, Reisegruppe"],
    ["シャツ", "シャツ", "shatsu", "Hemd, Shirt"],
  ],
  テ: [
    ["テレビ", "テレビ", "terebi", "Fernseher"],
    ["テスト", "テスト", "tesuto", "Test, Prüfung"],
  ],
  ト: [
    ["トイレ", "トイレ", "toire", "Toilette"],
    ["トマト", "トマト", "tomato", "Tomate"],
  ],
  ナ: [["ナイフ", "ナイフ", "naifu", "Messer"]],
  ニ: [["テニス", "テニス", "tenisu", "Tennis"]],
  ヌ: [["カヌー", "カヌー", "kanū", "Kanu"]],
  ネ: [
    ["ネクタイ", "ネクタイ", "nekutai", "Krawatte"],
    ["ネット", "ネット", "netto", "Internet"],
  ],
  ノ: [["ノート", "ノート", "nōto", "Notizheft"]],
  ハ: [
    ["ハム", "ハム", "hamu", "Schinken"],
    ["ハンバーガー", "ハンバーガー", "hanbāgā", "Hamburger"],
  ],
  ヒ: [
    ["コーヒー", "コーヒー", "kōhī", "Kaffee"],
    ["ヒーター", "ヒーター", "hītā", "Heizgerät"],
  ],
  フ: [["フランス", "フランス", "Furansu", "Frankreich"]],
  ヘ: [["ヘルメット", "ヘルメット", "herumetto", "Helm"]],
  ホ: [["ホテル", "ホテル", "hoteru", "Hotel"]],
  マ: [["マスク", "マスク", "masuku", "(Gesichts-)Maske"]],
  ミ: [["ミルク", "ミルク", "miruku", "Milch"]],
  ム: [
    ["ゲーム", "ゲーム", "gēmu", "(Video-)Spiel"],
    ["ハム", "ハム", "hamu", "Schinken"],
  ],
  メ: [
    ["メール", "メール", "mēru", "E-Mail, Nachricht"],
    ["メニュー", "メニュー", "menyū", "Speisekarte"],
  ],
  モ: [["モデル", "モデル", "moderu", "Modell; Model"]],
  ヤ: [["タイヤ", "タイヤ", "taiya", "Reifen"]],
  ユ: [["ユニフォーム", "ユニフォーム", "yunifōmu", "Uniform, Trikot"]],
  ヨ: [
    ["ヨーロッパ", "ヨーロッパ", "Yōroppa", "Europa"],
    ["ヨーグルト", "ヨーグルト", "yōguruto", "Joghurt"],
  ],
  ラ: [
    ["ラーメン", "ラーメン", "rāmen", "Ramen"],
    ["ラジオ", "ラジオ", "rajio", "Radio"],
  ],
  リ: [["リモコン", "リモコン", "rimokon", "Fernbedienung"]],
  ル: [
    ["ルール", "ルール", "rūru", "Regel"],
    ["ホテル", "ホテル", "hoteru", "Hotel"],
  ],
  レ: [
    ["レストラン", "レストラン", "resutoran", "Restaurant"],
    ["レモン", "レモン", "remon", "Zitrone"],
  ],
  ロ: [["ロボット", "ロボット", "robotto", "Roboter"]],
  ワ: [["ワイン", "ワイン", "wain", "Wein"]],
  ン: [
    ["パン", "パン", "pan", "Brot"],
    ["レストラン", "レストラン", "resutoran", "Restaurant"],
  ],

  // ---------- Katakana: Dakuten / Handakuten ----------
  ガ: [["ガス", "ガス", "gasu", "Gas"]],
  ギ: [["ギター", "ギター", "gitā", "Gitarre"]],
  グ: [["グラス", "グラス", "gurasu", "(Trink-)Glas"]],
  ゲ: [["ゲーム", "ゲーム", "gēmu", "(Video-)Spiel"]],
  ゴ: [["ゴルフ", "ゴルフ", "gorufu", "Golf"]],
  ザ: [["デザート", "デザート", "dezāto", "Dessert, Nachtisch"]],
  ジ: [["ラジオ", "ラジオ", "rajio", "Radio"]],
  ズ: [["チーズ", "チーズ", "chīzu", "Käse"]],
  ゼ: [["ゼロ", "ゼロ", "zero", "Null"]],
  ゾ: [["ゾーン", "ゾーン", "zōn", "Zone"]],
  ダ: [["ダンス", "ダンス", "dansu", "Tanz"]],
  デ: [["デパート", "デパート", "depāto", "Kaufhaus"]],
  ド: [["ドア", "ドア", "doa", "Tür"]],
  バ: [["バス", "バス", "basu", "Bus"]],
  ビ: [["ビール", "ビール", "bīru", "Bier"]],
  ブ: [["ブログ", "ブログ", "burogu", "Blog"]],
  ベ: [["ベッド", "ベッド", "beddo", "Bett"]],
  ボ: [["ボールペン", "ボールペン", "bōrupen", "Kugelschreiber"]],
  パ: [["パン", "パン", "pan", "Brot"]],
  ピ: [["ピアノ", "ピアノ", "piano", "Klavier"]],
  プ: [["プール", "プール", "pūru", "Schwimmbad"]],
  ペ: [["ペン", "ペン", "pen", "Stift"]],
  ポ: [["ポスト", "ポスト", "posuto", "Briefkasten"]],

  // ---------- Katakana: Yōon ----------
  キャ: [["キャンプ", "キャンプ", "kyanpu", "Camping"]],
  キュ: [["バーベキュー", "バーベキュー", "bābekyū", "Grillen, Barbecue"]],
  シャ: [
    ["シャワー", "シャワー", "shawā", "Dusche"],
    ["シャツ", "シャツ", "shatsu", "Hemd, Shirt"],
  ],
  シュ: [["シュークリーム", "シュークリーム", "shūkurīmu", "Windbeutel"]],
  ショ: [["ショッピング", "ショッピング", "shoppingu", "Einkaufen, Shopping"]],
  チャ: [["チャンス", "チャンス", "chansu", "Chance"]],
  チュ: [["チューリップ", "チューリップ", "chūrippu", "Tulpe"]],
  チョ: [["チョコレート", "チョコレート", "chokorēto", "Schokolade"]],
  ニュ: [
    ["ニュース", "ニュース", "nyūsu", "Nachrichten"],
    ["メニュー", "メニュー", "menyū", "Speisekarte"],
  ],
  ヒュ: [["ヒューズ", "ヒューズ", "hyūzu", "(elektrische) Sicherung"]],
  ミャ: [["ミャンマー", "ミャンマー", "Myanmā", "Myanmar"]],
  ミュ: [["ミュージアム", "ミュージアム", "myūjiamu", "Museum"]],
  リュ: [["リュック", "リュック", "ryukku", "Rucksack"]],
  ギャ: [["ギャラリー", "ギャラリー", "gyararī", "Galerie"]],
  ギョ: [["ギョーザ", "ギョーザ", "gyōza", "Gyōza (Teigtaschen)"]],
  ジャ: [["ジャケット", "ジャケット", "jaketto", "Jacke"]],
  ジュ: [["ジュース", "ジュース", "jūsu", "Saft"]],
  ジョ: [["ジョギング", "ジョギング", "jogingu", "Joggen"]],
  ビュ: [["ビュッフェ", "ビュッフェ", "byuffe", "Buffet"]],
  ピュ: [["ピューレ", "ピューレ", "pyūre", "Püree"]],

  // ---------- Katakana: erweitert ----------
  ファ: [
    ["ファン", "ファン", "fan", "Fan"],
    ["ファミレス", "ファミレス", "famiresu", "Familienrestaurant"],
  ],
  フィ: [["フィルム", "フィルム", "firumu", "Film (Rolle), Folie"]],
  フェ: [["カフェ", "カフェ", "kafe", "Café"]],
  フォ: [["フォーク", "フォーク", "fōku", "Gabel"]],
  ティ: [["パーティー", "パーティー", "pātī", "Party, Feier"]],
  ディ: [["ディナー", "ディナー", "dinā", "Abendessen (im Restaurant)"]],
  トゥ: [["タトゥー", "タトゥー", "tatū", "Tattoo"]],
  デュ: [["デュエット", "デュエット", "dyuetto", "Duett"]],
  ウィ: [["ウィンドウ", "ウィンドウ", "windō", "(Computer-)Fenster"]],
  ウェ: [["ウェブサイト", "ウェブサイト", "webusaito", "Website"]],
  ウォ: [["ウォーキング", "ウォーキング", "wōkingu", "Walking, Spazierengehen"]],
  シェ: [["シェフ", "シェフ", "shefu", "Küchenchef"]],
  ジェ: [["ジェットコースター", "ジェットコースター", "jettokōsutā", "Achterbahn"]],
  チェ: [["チェックイン", "チェックイン", "chekkuin", "Check-in"]],
  ヴ: [["ヴァイオリン", "ヴァイオリン", "vaiorin", "Violine (auch バイオリン)"]],
};

export function getKanaExamples(character: string): KanaExample[] {
  return (RAW[character] ?? []).map(([japanese, reading, romaji, german]) => ({
    japanese,
    reading,
    romaji,
    german,
  }));
}

export const KANA_EXAMPLE_CHARACTERS = Object.keys(RAW);
