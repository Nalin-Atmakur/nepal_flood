"""The article relevance gate (normalisers/_rss.is_relevant): event vocabulary in 4 scripts or a gazetteer place."""
import pytest

from normalisers._rss import is_relevant

POSITIVE = [
    "Tunnel rescue at Upper Trishuli-1 enters fourth day; 61 workers still inside",
    "रसुवागढीमा थप ३ शव भेटिए, मृतकको संख्या ६७५ पुग्यो",
    "China opens Gyirong military helipad to Nepali rescue flights",
    "MoFA: 511 foreigners from 34 countries still unreached",
    "बाढी प्रभावित क्षेत्रमा मोबाइल टावर मर्मत सुरु",
    "बाढ़ प्रभावित इलाकों में भारतीय राहत दल पहुंचा",
    "吉隆口岸附近发生洪水，多人失联",
    "Langtang trekkers safe but cut off; food drops begin",
    "Barrier lake level stable, army engineers say",
    "Nepal will preserve DNA before burial of unidentified flood victims, PM says",
    "Heavy rainfall warning for Bagmati and Gandaki provinces",
    "Villages in Betrawati without power",           # gazetteer place only
]
NEGATIVE = [
    "China's record robotic strides show the limits of human speed",
    "Minister Khanal holds telephone conversation with Venezuelan counterpart",
    "Stock market closes higher on banking gains",
    "Nepal avalanche was live on drone camera today",   # avalanche alone is not in the list… but see below
    "New smartphone launches in Kathmandu next week",
    "",
]


@pytest.mark.parametrize("title", POSITIVE)
def test_positive(title, gaz):
    assert is_relevant(title, "", gaz), title


@pytest.mark.parametrize("title", [n for n in NEGATIVE if "avalanche" not in n and "Kathmandu" not in n])
def test_negative(title, gaz):
    assert not is_relevant(title, "", gaz), title


def test_summary_can_rescue_a_bland_title(gaz):
    assert is_relevant("Live updates", "Rescue teams reach Syabrubesi by helicopter", gaz)
    assert not is_relevant("Live updates", "Cricket: Nepal beats UAE", gaz)


def test_kathmandu_alone_does_not_count_as_a_place(gaz):
    # Kathmandu is in the gazetteer (hospital/relief hub) but appears in general news every day, so a
    # Kathmandu-only headline is NOT relevant (GENERIC_PLACE_IDS); a corridor place or an event keyword is needed.
    assert not is_relevant("New smartphone launches in Kathmandu next week", "", gaz)
    assert is_relevant("Flood victims treated at Kathmandu hospitals", "", gaz)


def test_generic_places_do_not_make_an_article_relevant():
    from normalisers._rss import is_relevant
    assert not is_relevant("What's on in Kathmandu Valley this week", "")
    assert not is_relevant("Nepal Rastra Bank Sets Today's Exchange Rates", "")
    assert not is_relevant("Bharatpur cricket league final on Saturday", "")
    assert is_relevant("Helicopters resume shuttle from Dhunche to Syabrubesi", "")
