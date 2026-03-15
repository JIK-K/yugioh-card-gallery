import requests
import json

def fetch_pack_data(pack_code):
    pack_map = {
        "LOB": "Legend of Blue Eyes White Dragon",
        "MRD": "Metal Raiders",
        "SRL": "Spell Ruler",
        "PSV": "Pharaoh's SerVant",
        "LON": "Labyrinth Of Nightmare",
        "LOD": "Legacy Of Darkness",
        "PGD": "Pharaonic GuarDian",
        "MFC": "Magician's ForCe",
        "DCR": "Dark CRisis",
        "IOC": "Invasion Of Chaos",
        "AST": "Ancient SancTuary"
    }
    
    pack_name = pack_map.get(pack_code, pack_code)
    url = f"https://db.ygoprodeck.com/api/v7/cardinfo.php?set={pack_name.replace(' ', '%20')}"
    
    print(f"데이터를 가져오는 중: {pack_name}...")
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"오류 발생: {response.status_code}")
        return

    raw_data = response.json()['data']
    processed_cards = []

    for card in raw_data:
        set_info = next((s for s in card['card_sets'] if pack_name.lower() in s['set_name'].lower()), None)
        
        if set_info:
            processed_card = {
                "id": set_info['set_code'],
                "name": card['name'],
                "type": card['type'],
                "rarity": set_info['set_rarity'],
                "imgId": str(card['card_images'][0]['id'])
            }
            processed_cards.append(processed_card)

    count = len(processed_cards)
    print(f"데이터 추출 완료! 총 {count}개의 카드를 찾았습니다.")

    with open(f"{pack_code}.json", 'w', encoding='utf-8') as f:
        json.dump(processed_cards, f, ensure_ascii=False, indent=4)
    
    print(f"성공! '{pack_code}.json' 파일이 생성되었습니다.")

if __name__ == "__main__":
    fetch_pack_data("AST")