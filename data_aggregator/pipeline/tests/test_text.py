from lib import text as T


def test_digits_and_numbers():
    assert T.nepali_digits("२,४९८ / 1३") == "2,498 / 13"
    assert T.to_int("2,४९८") == 2498
    assert T.to_number("~193 km/h") == 193.0
    assert T.to_int("none") is None


def test_transliteration_match_keys():
    pairs = [("स्याफ्रुबेसी", "Syabrubesi"), ("Shyaprubesi", "Syaphrubesi"), ("धुन्चे", "Dhunche"), ("रसुवागढी", "Rasuwagadhi"),
             ("बेत्रावती", "Betrawati"), ("वेत्रवती", "Betravati"), ("गल्छी", "Galchi"), ("मैलुङ", "Mailung"), ("चितवन", "Chitwan"),
             ("टिमुरे", "Timure"), ("धादिङ", "Dhading"), ("तनहुँ", "Tanahun")]
    for a, b in pairs:
        assert T.match_key(a) == T.match_key(b), (a, b, T.match_key(a), T.match_key(b))
    assert T.dev_to_latin("धुन्चे") == "dhunche"
    assert T.match_key("吉隆口岸") == "吉隆口岸"
    assert T.latin_to_dev("timure").startswith("ट") or T.latin_to_dev("timure").startswith("त")


def test_script_and_language():
    assert T.lang_of("रसुवाका गाउँहरू सञ्चारविहीन") == "ne"
    assert T.lang_of("बाढ़ प्रभावित इलाकों में भारतीय राहत दल पहुंचा") == "hi"
    assert T.lang_of("Nepal flood death toll rises") == "en"
    assert T.lang_of("吉隆口岸") == "zh"
    assert T.script_of("Timure टिमुरे") in ("mixed", "latn", "deva")


def test_phones():
    assert T.normalise_phone("९८४१२३४५६७") == "+9779841234567"
    assert T.normalise_phone("+977 984-1234567") == "+9779841234567"
    assert T.normalise_phone("00977 9841234567") == "+9779841234567"
    assert T.normalise_phone("+91 98765 43210") == "+919876543210"
    assert T.normalise_phone("08765432109") == "+918765432109"   # 98… is ambiguous and defaults to Nepal
    assert T.normalise_phone("01-4211234") == "+97714211234"
    assert T.normalise_phone("hello") is None
    assert T.normalise_phone("12") is None


def test_keys_and_hashes():
    k1 = T.person_key(phone="9841234567")
    assert k1 == T.person_key(phone="+977-9841234567") and len(k1) == 64
    assert T.person_key(passport="PU846865") == T.person_key(passport="pu 846865")
    assert T.person_key(name="Ram Bahadur Tamang", age=34, nationality="Nepali") == T.person_key(name="Tamang Ram Bahadur", age=35, nationality="nepali")
    assert T.person_key(name="Ram Bahadur Tamang", age=34, nationality="Nepali") != T.person_key(name="Ram Bahadur Tamang", age=50, nationality="Nepali")
    assert T.person_key() is None
    assert T.group_key("Isha Foundation", None) == T.group_key(None, "isha foundation")
    assert T.age_band(5) == "0-17" and T.age_band("40") == "40-64" and T.age_band(70) == "65+" and T.age_band(None) is None


def test_redaction():
    out = T.redact_pii("Call 9841234567 or ram@example.com, passport PU846865, Ram Bahadur was there", names=["Ram Bahadur"])
    assert "9841234567" not in out and "example.com" not in out and "PU846865" not in out and "Ram Bahadur" not in out
    assert "[phone]" in out and "[email]" in out and "[id]" in out and "[name]" in out


def test_jaro_winkler():
    assert T.jaro_winkler("timure", "timure") == 1.0
    assert T.jaro_winkler("rasuwagadhi", "rasuwagadi") > 0.95
    assert T.jaro_winkler("abc", "xyz") == 0.0


def test_slugify():
    assert T.slugify("Bhote Koshi at Shyaprubesi") == "bhote_koshi_at_shyaprubesi"
    assert T.slugify("टिमुरे, रसुवा") == "timure_rasuvaa"
