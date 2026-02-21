-- Master Product Catalog with Vegetables, Fruits, and Grains
-- Products are templates that vendors can add to their inventory
-- Vendors control IsLive status for their inventory

-- Create MasterProducts table if not exists
CREATE TABLE IF NOT EXISTS "MasterProducts" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" VARCHAR(200) NOT NULL,
    "NameHindi" VARCHAR(200),
    "Category" VARCHAR(100) NOT NULL, -- Vegetable, Fruit, Grain
    "SubCategory" VARCHAR(100),
    "Description" TEXT,
    "Unit" VARCHAR(50) NOT NULL DEFAULT 'kg',
    "ImageUrls" TEXT[], -- Array of image URLs
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- VEGETABLES (Complete A-Z List with Hindi Names)
INSERT INTO "MasterProducts" ("Name", "NameHindi", "Category", "SubCategory", "Description", "Unit", "ImageUrls") VALUES
-- A
('Artichoke', 'आर्टिचोक', 'Vegetable', 'Flower', 'Globe artichoke with edible flower buds', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1606836576983-8b458e75221d', 'https://images.unsplash.com/photo-1582515073490-39981397c445']),
('Arugula (Rocket)', 'रॉकेट साग', 'Vegetable', 'Leafy', 'Peppery salad green with distinctive flavor', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1', 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9']),
('Asparagus', 'शतावरी', 'Vegetable', 'Stem', 'Green spear vegetable, tender and nutritious', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1565082608844-5d1ffecc3354', 'https://images.unsplash.com/photo-1597735423755-13ebf6803838']),
('Amaranth Leaves', 'चौलाई साग', 'Vegetable', 'Leafy', 'Nutritious leafy vegetable, rich in iron', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1', 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5']),

-- B
('Beans (Green)', 'हरी फली', 'Vegetable', 'Legume', 'Long green beans, crunchy and fresh', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1597150742133-21a1c8d19e47', 'https://images.unsplash.com/photo-1540420773420-3366772f4999']),
('Beetroot', 'चुकंदर', 'Vegetable', 'Root', 'Deep red root vegetable, sweet and earthy', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1566554273541-37a9ca77b91f', 'https://images.unsplash.com/photo-1606768715955-e9f8b896f0fc']),
('Bell Pepper (Capsicum)', 'शिमला मिर्च', 'Vegetable', 'Fruit', 'Colorful sweet peppers - red, yellow, green', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1563565375-f3fdfdbefa83', 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba']),
('Bitter Gourd (Karela)', 'करेला', 'Vegetable', 'Gourd', 'Green bitter vegetable, highly nutritious', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1620627938074-d0e0f5f89c5d', 'https://images.unsplash.com/photo-1608181715160-5e85e5f87e9f']),
('Bottle Gourd (Lauki)', 'लौकी / घीया', 'Vegetable', 'Gourd', 'Light green long vegetable, cooling properties', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1625683503834-e00ddd2fbc6d', 'https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48']),
('Broccoli', 'हरी गोभी / ब्रोकली', 'Vegetable', 'Flower', 'Green florets, superfood rich in vitamins', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c', 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a']),
('Brussels Sprouts', 'ब्रसेल्स स्प्राउट्स', 'Vegetable', 'Flower', 'Mini cabbage-like vegetables', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1618164436241-4473940d1f5c', 'https://images.unsplash.com/photo-1610313535086-0a8a5e59d8c6']),

-- C
('Cabbage', 'पत्तागोभी / बंदगोभी', 'Vegetable', 'Leafy', 'Round leafy vegetable, versatile for cooking', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1594282443280-4df1a8848926', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba']),
('Carrot', 'गाजर', 'Vegetable', 'Root', 'Orange root vegetable, crunchy and sweet', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37', 'https://images.unsplash.com/photo-1582515073490-39981397c445']),
('Cauliflower', 'फूलगोभी', 'Vegetable', 'Flower', 'White florets, popular in Indian cuisine', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1568584711271-6b2c72f06b8e', 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785']),
('Celery', 'अजमोद', 'Vegetable', 'Stem', 'Crunchy stalks with aromatic flavor', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1617099931554-7e3d58ea3b87', 'https://images.unsplash.com/photo-1612506408155-b9c05e94cf6e']),
('Chili (Green)', 'हरी मिर्च', 'Vegetable', 'Fruit', 'Spicy green chilies for heat', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1583846112901-652d8e5a8c7b', 'https://images.unsplash.com/photo-1601834711223-da3e2dc77eec']),
('Chili (Red)', 'लाल मिर्च', 'Vegetable', 'Fruit', 'Dried or fresh red chilies, very spicy', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1604908177453-7462950a6a3b', 'https://images.unsplash.com/photo-1583846112901-652d8e5a8c7b']),
('Cluster Beans (Guar)', 'ग्वार फली', 'Vegetable', 'Legume', 'Long green beans with cluster growth', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1597150742133-21a1c8d19e47', 'https://images.unsplash.com/photo-1540420773420-3366772f4999']),
('Coriander Leaves (Cilantro)', 'हरा धनिया', 'Vegetable', 'Leafy', 'Fresh aromatic herb for garnishing', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1607672800557-7ca333018210', 'https://images.unsplash.com/photo-1532336414038-cf19250c5757']),
('Corn (Sweet Corn)', 'मक्का / भुट्टा', 'Vegetable', 'Grain', 'Sweet yellow corn kernels', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1551754655-cd27e38d2076', 'https://images.unsplash.com/photo-1603048588665-791ca8aea617']),
('Cucumber', 'खीरा', 'Vegetable', 'Gourd', 'Green crunchy vegetable, refreshing and hydrating', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']),
('Curry Leaves', 'करी पत्ता / मीठी नीम', 'Vegetable', 'Leafy', 'Aromatic leaves for Indian cooking', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1607672800557-7ca333018210', 'https://images.unsplash.com/photo-1532336414038-cf19250c5757']),

-- D
('Dill Leaves', 'सोआ', 'Vegetable', 'Leafy', 'Feathery herb with distinctive flavor', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1607672800557-7ca333018210', 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5']),
('Drumstick (Moringa)', 'सहजन / मोरिंगा', 'Vegetable', 'Pod', 'Long green pods, highly nutritious', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1597150742133-21a1c8d19e47', 'https://images.unsplash.com/photo-1540420773420-3366772f4999']),

-- E
('Eggplant (Brinjal)', 'बैंगन', 'Vegetable', 'Fruit', 'Purple vegetable, versatile for cooking', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a', 'https://images.unsplash.com/photo-1615485291521-9a85ccd2e2c4']),

-- F
('Fenugreek Leaves (Methi)', 'मेथी के पत्ते', 'Vegetable', 'Leafy', 'Slightly bitter leafy vegetable', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48', 'https://images.unsplash.com/photo-1606815780777-dd5e93e92d27']),
('French Beans', 'फ्रेंच बीन्स', 'Vegetable', 'Legume', 'Fine green beans, tender and sweet', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1597150742133-21a1c8d19e47', 'https://images.unsplash.com/photo-1540420773420-3366772f4999']),

-- G
('Garlic', 'लहसुन', 'Vegetable', 'Bulb', 'Aromatic bulb used for flavoring', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db', 'https://images.unsplash.com/photo-1583487050068-dc3bcbc3e8ec']),
('Ginger', 'अदरक', 'Vegetable', 'Root', 'Spicy root for cooking and medicinal use', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1599789042104-e06af48a2487', 'https://images.unsplash.com/photo-1616684051454-bae85863e5b9']),
('Green Peas', 'हरी मटर', 'Vegetable', 'Legume', 'Sweet green peas in pods', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1587735243615-c03f25aaff15', 'https://images.unsplash.com/photo-1568584711271-6b2c72f06b8e']),

-- I
('Ivy Gourd (Tindora)', 'कुंदरू / टिंडोरा', 'Vegetable', 'Gourd', 'Small green gourd, popular in Indian cooking', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']),

-- J
('Jackfruit (Raw)', 'कच्चा कटहल', 'Vegetable', 'Fruit', 'Large green fruit used as vegetable when raw', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1618659879934-c4fc1c4b8002', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']),

-- K
('Kale', 'केल', 'Vegetable', 'Leafy', 'Dark green superfood leaves', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1574316071802-0d684efa7bf5', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1']),
('Kohlrabi', 'गांठ गोभी / नूल खोल', 'Vegetable', 'Stem', 'Round turnip-like vegetable', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1594282443280-4df1a8848926', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba']),

-- L
('Lady Finger (Okra)', 'भिंडी', 'Vegetable', 'Fruit', 'Green finger-shaped vegetable', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1632074016984-e5d8b9d6edca', 'https://images.unsplash.com/photo-1603048719458-0ce104d7e1d0']),
('Leek', 'गंधना', 'Vegetable', 'Bulb', 'Mild onion-like vegetable', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb', 'https://images.unsplash.com/photo-1587486913049-53fc88980cdb']),
('Lettuce', 'सलाद पत्ता', 'Vegetable', 'Leafy', 'Crisp salad leaves in various types', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1', 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9']),

-- M
('Mint Leaves', 'पुदीना', 'Vegetable', 'Leafy', 'Refreshing aromatic herb', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1607672800557-7ca333018210', 'https://images.unsplash.com/photo-1532336414038-cf19250c5757']),
('Mushroom', 'मशरूम / कुकुरमुत्ता', 'Vegetable', 'Fungus', 'Edible fungi, rich in protein', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1565886893798-60ca3a3ea0e3', 'https://images.unsplash.com/photo-1617099919550-1b9e8f37c512']),
('Mustard Greens', 'सरसों का साग', 'Vegetable', 'Leafy', 'Peppery greens used in Indian cuisine', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1574316071802-0d684efa7bf5', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1']),

-- O
('Onion', 'प्याज', 'Vegetable', 'Bulb', 'Essential cooking vegetable, adds base flavor', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb', 'https://images.unsplash.com/photo-1587486913049-53fc88980cdb']),
('Onion (Spring/Green)', 'हरा प्याज', 'Vegetable', 'Bulb', 'Young onions with green stalks', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb', 'https://images.unsplash.com/photo-1587486913049-53fc88980cdb']),

-- P
('Parsley', 'अजमोदा', 'Vegetable', 'Leafy', 'Fresh herb for garnishing', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1607672800557-7ca333018210', 'https://images.unsplash.com/photo-1532336414038-cf19250c5757']),
('Pointed Gourd (Parwal)', 'परवल', 'Vegetable', 'Gourd', 'Small striped green gourd', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']),
('Potato', 'आलू', 'Vegetable', 'Tuber', 'Most versatile vegetable, staple ingredient', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1518977676601-b53f82aba655', 'https://images.unsplash.com/photo-1590165482129-1b8b27698780']),
('Pumpkin', 'कद्दू', 'Vegetable', 'Gourd', 'Large orange squash, sweet and nutritious', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1569976710208-b52636b52c09', 'https://images.unsplash.com/photo-1570586437263-ab629fccc818']),

-- R
('Radish', 'मूली', 'Vegetable', 'Root', 'White root vegetable with peppery flavor', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1586641828040-96a7fa485252', 'https://images.unsplash.com/photo-1607620962602-c38d57e3b6e4']),
('Ridge Gourd (Turai)', 'तोरी / तुरई', 'Vegetable', 'Gourd', 'Green ridged gourd vegetable', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48', 'https://images.unsplash.com/photo-1625683503834-e00ddd2fbc6d']),

-- S
('Shallots', 'छोटा प्याज / प्याज की जड़', 'Vegetable', 'Bulb', 'Small sweet onions', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb', 'https://images.unsplash.com/photo-1587486913049-53fc88980cdb']),
('Snake Gourd', 'चिचिंडा', 'Vegetable', 'Gourd', 'Long twisted green gourd', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']),
('Spinach', 'पालक', 'Vegetable', 'Leafy', 'Dark green leafy vegetable, iron-rich', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb', 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5']),
('Sponge Gourd (Tori)', 'नेनुआ / घिया तोरी', 'Vegetable', 'Gourd', 'Soft fibrous gourd vegetable', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48', 'https://images.unsplash.com/photo-1625683503834-e00ddd2fbc6d']),
('Sweet Potato', 'शकरकंद', 'Vegetable', 'Tuber', 'Sweet orange tuber vegetable', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1518977676601-b53f82aba655', 'https://images.unsplash.com/photo-1590165482129-1b8b27698780']),

-- T
('Taro Root (Arbi)', 'अरबी', 'Vegetable', 'Tuber', 'Starchy root vegetable', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1518977676601-b53f82aba655', 'https://images.unsplash.com/photo-1590165482129-1b8b27698780']),
('Tomato', 'टमाटर', 'Vegetable', 'Fruit', 'Red juicy fruit-vegetable, cooking essential', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1546470427-e26264be0b0d', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea']),
('Turnip', 'शलजम', 'Vegetable', 'Root', 'White-purple root vegetable', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1607623066833-e629d4c31c1e', 'https://images.unsplash.com/photo-1595854758952-4a937b1d51d0']),

-- Z
('Zucchini', 'तोरी / जुकीनी', 'Vegetable', 'Gourd', 'Green summer squash', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']);

-- FRUITS (Complete A-Z List with Hindi Names)
INSERT INTO "MasterProducts" ("Name", "NameHindi", "Category", "SubCategory", "Description", "Unit", "ImageUrls") VALUES
-- A
('Apple', 'सेब', 'Fruit', 'Pome', 'Crisp fruit in red, green varieties', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb']),
('Apricot', 'खुबानी', 'Fruit', 'Stone Fruit', 'Orange stone fruit with velvety skin', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1591206369811-4eeb2f03bc95', 'https://images.unsplash.com/photo-1585042831372-da19c86c93ec']),
('Avocado', 'एवोकाडो / मक्खन फल', 'Fruit', 'Berry', 'Creamy green fruit, rich in healthy fats', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1523049673857-eb18f1d7b578', 'https://images.unsplash.com/photo-1606097948300-43f7f6a5f1c6']),

-- B
('Banana', 'केला', 'Fruit', 'Tropical', 'Yellow tropical fruit, rich in potassium', 'dozen', 
    ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e', 'https://images.unsplash.com/photo-1603833797131-3c0a02759b8e']),
('Blackberry', 'ब्लैकबेरी / काला जामुन', 'Fruit', 'Berry', 'Small dark purple berries', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e', 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc']),
('Blueberry', 'ब्लूबेरी / नीलबदरी', 'Fruit', 'Berry', 'Small blue antioxidant-rich berries', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1498557850523-fd3d118b962e', 'https://images.unsplash.com/photo-1587239494269-1f8614f3b9dc']),

-- C
('Cherry', 'चेरी', 'Fruit', 'Stone Fruit', 'Small red sweet stone fruit', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1528821128474-27f963b062bf', 'https://images.unsplash.com/photo-1591206369811-4eeb2f03bc95']),
('Coconut', 'नारियल', 'Fruit', 'Tropical', 'Hard-shelled fruit with water and white flesh', 'piece', 
    ARRAY['https://images.unsplash.com/photo-1539181585528-6c4f99e73e4a', 'https://images.unsplash.com/photo-1585238341710-4a2506f8a999']),
('Custard Apple (Sitaphal)', 'सीताफल / शरीफा', 'Fruit', 'Tropical', 'Green scaly fruit with creamy sweet flesh', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1625850218888-92fbbe55ebc7', 'https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48']),

-- D
('Dates', 'खजूर', 'Fruit', 'Dried', 'Sweet dried fruit from palm tree', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1582103501462-c10c2d3e4d0d', 'https://images.unsplash.com/photo-1609702484399-97846d75d8eb']),
('Dragon Fruit', 'ड्रैगन फ्रूट / कमलम', 'Fruit', 'Cactus', 'Pink exotic fruit with white spotted flesh', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1541167763980-8a384ce05f67', 'https://images.unsplash.com/photo-1609241409313-3f3097e92c9d']),

-- F
('Fig', 'अंजीर', 'Fruit', 'Stone Fruit', 'Sweet soft fruit, dried or fresh', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1581840918346-bdfe7d10fe40', 'https://images.unsplash.com/photo-1614969524399-369f25fab4a3']),

-- G
('Gooseberry (Amla)', 'आंवला', 'Fruit', 'Berry', 'Sour green berry, very nutritious', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']),
('Grapefruit', 'चकोतरा', 'Fruit', 'Citrus', 'Large pink citrus fruit', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1589227365533-cee0203d2485', 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7']),
('Grapes (Green)', 'हरे अंगूर', 'Fruit', 'Berry', 'Sweet green grapes in bunches', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1537640538966-79f369143f8f', 'https://images.unsplash.com/photo-1599819177197-ddee1f2c9fb6']),
('Grapes (Black)', 'काले अंगूर', 'Fruit', 'Berry', 'Sweet dark purple grapes', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1599819177197-ddee1f2c9fb6', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f']),
('Guava', 'अमरूद', 'Fruit', 'Tropical', 'Green or pink fruit, vitamin C rich', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1598260487200-48fb59f46b0c', 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46']),

-- J
('Jackfruit', 'कटहल', 'Fruit', 'Tropical', 'Large spiky fruit with sweet yellow flesh', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1618659879934-c4fc1c4b8002', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']),
('Jamun (Indian Blackberry)', 'जामुन', 'Fruit', 'Berry', 'Dark purple Indian fruit', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1542838132-92c53300491e', 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc']),

-- K
('Kiwi', 'कीवी', 'Fruit', 'Berry', 'Brown fuzzy fruit with bright green flesh', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1519899187110-95c87b3c9cfa', 'https://images.unsplash.com/photo-1585059895524-72359e06133a']),

-- L
('Lemon', 'नींबू', 'Fruit', 'Citrus', 'Tangy yellow citrus for drinks and cooking', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1590502593747-42a996133562', 'https://images.unsplash.com/photo-1587486936938-18c0ac9e8b5e']),
('Litchi (Lychee)', 'लीची', 'Fruit', 'Tropical', 'Small red fruit with translucent sweet flesh', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1611047833733-40ed7d5dd586', 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15']),

-- M
('Mango', 'आम', 'Fruit', 'Tropical', 'King of fruits, sweet and juicy', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1553279768-865429fa0078', 'https://images.unsplash.com/photo-1605635543814-5a6c1f1e5fb3']),
('Melon (Musk)', 'खरबूजा', 'Fruit', 'Melon', 'Orange sweet melon, summer fruit', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1589927986089-35812388d1f4', 'https://images.unsplash.com/photo-1621583832709-438b96ed0634']),
('Mulberry', 'शहतूत', 'Fruit', 'Berry', 'Small purple-red berries', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1464454709131-ffd692591ee5', 'https://images.unsplash.com/photo-1542838132-92c53300491e']),

-- O
('Orange', 'संतरा / नारंगी', 'Fruit', 'Citrus', 'Juicy orange citrus, vitamin C rich', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1580052614034-c55d20bfee3b', 'https://images.unsplash.com/photo-1547514701-42782101795e']),

-- P
('Papaya', 'पपीता', 'Fruit', 'Tropical', 'Orange tropical fruit, aids digestion', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1517282009859-f000ec3b26fe', 'https://images.unsplash.com/photo-1607987169745-dd13d5d87b3b']),
('Passion Fruit', 'कृष्णा फल', 'Fruit', 'Tropical', 'Purple wrinkled fruit with tangy pulp', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1594137469169-9c160bb3d6aa', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']),
('Peach', 'आड़ू', 'Fruit', 'Stone Fruit', 'Soft fuzzy fruit with sweet juicy flesh', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1585042831372-da19c86c93ec', 'https://images.unsplash.com/photo-1629828874514-d05ec02e0e5d']),
('Pear', 'नाशपाती', 'Fruit', 'Pome', 'Green or yellow fruit with soft texture', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1567452889471-a0ec48f6bb7e', 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7']),
('Persimmon', 'जापानी फल / तेंदू', 'Fruit', 'Berry', 'Orange sweet fruit when ripe', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1574940135383-82a9e2d0e898', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4']),
('Pineapple', 'अनानास', 'Fruit', 'Tropical', 'Spiky tropical fruit with sweet yellow flesh', 'piece', 
    ARRAY['https://images.unsplash.com/photo-1550828486-e9f1bf57c0b6', 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1']),
('Plum', 'आलूबुखारा / बेर', 'Fruit', 'Stone Fruit', 'Small purple or red stone fruit', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1598134493287-69a5b83e8c6b', 'https://images.unsplash.com/photo-1570197788417-0e82375c9371']),
('Pomegranate', 'अनार', 'Fruit', 'Berry', 'Red fruit with juicy ruby seeds', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1615485290382-441e4d049cb5', 'https://images.unsplash.com/photo-1603067921853-d43f0894f2a9']),

-- R
('Raisins', 'किशमिश', 'Fruit', 'Dried', 'Dried grapes, sweet and chewy', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1587735243615-c03f25aaff15', 'https://images.unsplash.com/photo-1599819177197-ddee1f2c9fb6']),
('Raspberry', 'रसभरी', 'Fruit', 'Berry', 'Small red berries, sweet-tart flavor', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1577069861033-55d04cec4ef5', 'https://images.unsplash.com/photo-1577003833154-a6e6d52de145']),

-- S
('Sapota (Chikoo)', 'चीकू', 'Fruit', 'Tropical', 'Brown sweet fruit with granular texture', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1625850218888-92fbbe55ebc7', 'https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48']),
('Starfruit (Carambola)', 'कमरख', 'Fruit', 'Tropical', 'Yellow star-shaped fruit', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1589927986089-35812388d1f4', 'https://images.unsplash.com/photo-1541167763980-8a384ce05f67']),
('Strawberry', 'स्ट्रॉबेरी', 'Fruit', 'Berry', 'Red heart-shaped berries, sweet and juicy', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1518635017498-87f514b751ba', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6']),
('Sweet Lime (Mosambi)', 'मौसमी', 'Fruit', 'Citrus', 'Sweet citrus fruit, refreshing juice', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1587735243615-c03f25aaff15', 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b']),

-- T
('Tamarind', 'इमली', 'Fruit', 'Pod', 'Tangy brown fruit in pods', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1587735243615-c03f25aaff15', 'https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48']),

-- W
('Watermelon', 'तरबूज', 'Fruit', 'Melon', 'Large red fruit, very refreshing', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1587049352846-4a222e784329', 'https://images.unsplash.com/photo-1598636130723-2d0fcf36bb1a']),
('Wood Apple (Bael)', 'बेल', 'Fruit', 'Tropical', 'Hard-shelled fruit with aromatic pulp', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1625850218888-92fbbe55ebc7', 'https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48']);

-- GRAINS & PULSES
INSERT INTO "MasterProducts" ("Name", "NameHindi", "Category", "SubCategory", "Description", "Unit", "ImageUrls") VALUES
-- Rice Varieties
('Basmati Rice', 'बासमती चावल', 'Grain', 'Rice', 'Premium long grain aromatic rice', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c', 'https://images.unsplash.com/photo-1596797038530-2c107229654b']),
('White Rice', 'सफेद चावल', 'Grain', 'Rice', 'Regular white rice for daily use', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1589563309891-acee2421a00c', 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6']),
('Brown Rice', 'भूरा चावल', 'Grain', 'Rice', 'Whole grain rice, more nutritious', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1585852315291-e64d8f59a4bc', 'https://images.unsplash.com/photo-1599521656089-eb880c6e7d8e']),
('Sona Masoori Rice', 'सोना मसूरी', 'Grain', 'Rice', 'Medium grain rice from South India', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c', 'https://images.unsplash.com/photo-1589563309891-acee2421a00c']),

-- Wheat Products
('Wheat', 'गेहूं', 'Grain', 'Wheat', 'Whole wheat grains', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', 'https://images.unsplash.com/photo-1595855759920-86be41572c4d']),
('Wheat Flour', 'आटा', 'Grain', 'Wheat', 'Ground wheat flour for chapati', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb', 'https://images.unsplash.com/photo-1556910110-a5a63dfd393c']),
('Maida', 'मैदा', 'Grain', 'Wheat', 'Refined wheat flour', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb', 'https://images.unsplash.com/photo-1587354369598-0e0c7f71b64e']),

-- Pulses (Dals)
('Toor Dal', 'तूर दाल', 'Grain', 'Pulse', 'Yellow pigeon peas, staple dal', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1595855759920-86be41572c4d', 'https://images.unsplash.com/photo-1588165842347-7c605e7a4594']),
('Moong Dal', 'मूंग दाल', 'Grain', 'Pulse', 'Green gram dal, light and nutritious', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1598835158138-b7d665c8bf06', 'https://images.unsplash.com/photo-1625912379200-95f97f4d3285']),
('Masoor Dal', 'मसूर दाल', 'Grain', 'Pulse', 'Red lentils, cooks quickly', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1615485891162-3a92662e7174', 'https://images.unsplash.com/photo-1568059616370-ddd8e17c0cdf']),
('Chana Dal', 'चना दाल', 'Grain', 'Pulse', 'Split bengal gram, popular dal', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1621953006149-b2c67c2b0ef0', 'https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48']),
('Urad Dal', 'उड़द दाल', 'Grain', 'Pulse', 'Black gram dal, used in South Indian dishes', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48', 'https://images.unsplash.com/photo-1625912379200-95f97f4d3285']),
('Whole Moong', 'साबुत मूंग', 'Grain', 'Pulse', 'Whole green gram with skin', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1598835158138-b7d665c8bf06', 'https://images.unsplash.com/photo-1615485891162-3a92662e7174']),
('Rajma', 'राजमा', 'Grain', 'Pulse', 'Red kidney beans', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1595855759920-86be41572c4d', 'https://images.unsplash.com/photo-1588165842347-7c605e7a4594']),
('Kabuli Chana', 'काबुली चना', 'Grain', 'Pulse', 'White chickpeas', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1621953006149-b2c67c2b0ef0', 'https://images.unsplash.com/photo-1598835158138-b7d665c8bf06']),
('Black Chana', 'काला चना', 'Grain', 'Pulse', 'Black chickpeas, nutritious', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1615485891162-3a92662e7174', 'https://images.unsplash.com/photo-1628020632860-5d8e7e1e8c48']),

-- Other Grains
('Barley', 'जौ', 'Grain', 'Cereal', 'Nutritious whole grain', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b', 'https://images.unsplash.com/photo-1595855759920-86be41572c4d']),
('Oats', 'ओट्स', 'Grain', 'Cereal', 'Healthy breakfast grain', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1589567776020-f7e8c625f7e3', 'https://images.unsplash.com/photo-1547558840-8ad9a6c7c4b1']),
('Quinoa', 'किनोवा', 'Grain', 'Cereal', 'Protein-rich superfood grain', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1586444248902-2f64eddc13df', 'https://images.unsplash.com/photo-1612536568686-b8e7b1bea160']),
('Millets', 'बाजरा', 'Grain', 'Cereal', 'Traditional nutritious grain', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1595855759920-86be41572c4d', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b']),
('Cornmeal', 'मक्का का आटा', 'Grain', 'Cereal', 'Ground corn flour', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb', 'https://images.unsplash.com/photo-1595855759920-86be41572c4d']),
('Semolina', 'सूजी', 'Grain', 'Wheat', 'Coarse wheat flour for upma', 'kg', 
    ARRAY['https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb', 'https://images.unsplash.com/photo-1556910110-a5a63dfd393c']);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_master_products_category ON "MasterProducts"("Category");
CREATE INDEX IF NOT EXISTS idx_master_products_name ON "MasterProducts"("Name");

-- Update the Products table to link with MasterProducts
-- This allows vendors to add master products to their inventory

ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "MasterProductId" UUID;
ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "IsLive" BOOLEAN DEFAULT false;

-- Add foreign key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_Products_MasterProducts'
    ) THEN
        ALTER TABLE "Products" 
        ADD CONSTRAINT "FK_Products_MasterProducts" 
        FOREIGN KEY ("MasterProductId") 
        REFERENCES "MasterProducts"("Id") 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Create view for live vendor products
CREATE OR REPLACE VIEW "VendorLiveProducts" AS
SELECT 
    p."Id" as "ProductId",
    p."VendorId",
    p."Name",
    p."Price",
    p."Unit",
    p."Stock",
    p."IsLive",
    mp."Category",
    mp."SubCategory",
    mp."ImageUrls",
    mp."NameHindi",
    mp."Description"
FROM "Products" p
LEFT JOIN "MasterProducts" mp ON p."MasterProductId" = mp."Id"
WHERE p."IsLive" = true;

SELECT 'Master products catalog seeded successfully!' as message,
       (SELECT COUNT(*) FROM "MasterProducts" WHERE "Category" = 'Vegetable') as vegetables,
       (SELECT COUNT(*) FROM "MasterProducts" WHERE "Category" = 'Fruit') as fruits,
       (SELECT COUNT(*) FROM "MasterProducts" WHERE "Category" = 'Grain') as grains;
