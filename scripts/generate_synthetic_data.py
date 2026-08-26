import os
import random
import datetime
import csv

# Ensure directories exist
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR = os.path.join(BASE_DIR, 'backend', 'data', 'synthetic')
FIRS_DIR = os.path.join(DATA_DIR, 'firs')

os.makedirs(FIRS_DIR, exist_ok=True)

# Characters and Entities in the story
network_nodes = {
    'vikram_sharma': {'name': 'Vikram Sharma', 'role': 'Drug Trafficking Lead', 'phones': ['+91-98765-11111', '+91-98765-11112'], 'accounts': ['1000000000001', '1000000000002'], 'vehicles': ['MH-12-AB-1111', 'RJ-14-CD-2222']},
    'suresh_agarwal': {'name': 'Suresh Agarwal', 'role': 'Money Laundering Lead', 'phones': ['+91-98765-22222'], 'accounts': ['2000000000001', '2000000000002', '2000000000003'], 'vehicles': ['MH-02-EF-3333']},
    'mohammed_irfan': {'name': 'Mohammed Irfan', 'role': 'Extortion Lead', 'phones': ['+91-98765-33333', '+91-98765-33334'], 'accounts': ['3000000000001'], 'vehicles': ['DL-01-GH-4444', 'DL-01-GH-4445']},
    'deepak_chauhan': {'name': 'Deepak Chauhan', 'role': 'Broker', 'phones': ['+91-98765-44444'], 'accounts': ['4000000000001', '4000000000002'], 'vehicles': ['UP-16-IJ-5555']},
}

cities = ['Delhi', 'Mumbai', 'Jaipur', 'Pune', 'Noida', 'Gurgaon']
banks = ['SBI', 'HDFC', 'ICICI', 'PNB', 'Axis Bank']

# Helper to generate random timestamps within the last 90 days
def random_date(start, end):
    return start + datetime.timedelta(
        seconds=random.randint(0, int((end - start).total_seconds())),
    )

end_date = datetime.datetime.now()
start_date = end_date - datetime.timedelta(days=90)

# 1. Generate FIRs (30 total)
print("Generating FIRs...")
fir_templates = [
    # Drug trafficking templates (Vikram Sharma & Deepak Chauhan)
    "FIR No. {fir_num}/2024\nPolice Station: {ps}\nDistrict: {dist}\nDate: {date}\n\nInformation received regarding a major narcotics smuggling operation. A suspicious vehicle with plate {vehicle} was intercepted in {city}. During the search, 15 kg of ganja and other illegal drugs were recovered. The driver confessed to working for {accused1}. Further investigation revealed that {accused2} is acting as a broker for distributing the contraband across the state.\n\nSeveral mobile phones were seized. The primary phone number used for coordinating the drug trafficking is {phone}. The accused threatened the officers during the arrest. NDPS act invoked.",
    
    # Money Laundering templates (Suresh Agarwal & Deepak Chauhan)
    "FIR No. {fir_num}/2024\nPolice Station: {ps}\nDistrict: {dist}\nDate: {date}\n\nAn investigation by the Economic Offences Wing has uncovered a massive hawala and money laundering network. Suspect {accused1} is running multiple shell companies to route illicit funds. Bank account {account} at {bank} has seen suspicious transactions over the last two months. \n\nEvidence points to {accused2} facilitating these benami transactions. Sums of money are being transferred as 'business payments'. A raid at the {city} office yielded documents linking them to international syndicates.",
    
    # Extortion templates (Mohammed Irfan & Deepak Chauhan)
    "FIR No. {fir_num}/2024\nPolice Station: {ps}\nDistrict: {dist}\nDate: {date}\n\nComplainant reported receiving multiple threat calls from phone number {phone} demanding hafta (protection money). The caller identified himself as a member of {accused1}'s gang. The gang has been extorting businessmen in the {city} area.\n\nThe complainant was asked to transfer funds to account {account}. Witnesses reported seeing the gang members scouting the area in vehicle {vehicle}. There are indications that {accused2} is helping them launder the extorted money.",
    
    # General crime mixing them
    "FIR No. {fir_num}/2024\nPolice Station: {ps}\nDistrict: {dist}\nDate: {date}\n\nA joint operation in {city} resulted in the arrest of associates linked to {accused1} and {accused2}. They were found in possession of unlicensed firearms and unaccounted cash. Vehicle {vehicle} was impounded at the scene.\n\nFinancial records seized show transfers to account {account}. Phone {phone} contains WhatsApp chats discussing ransom, illicit drugs, and hawala transfers. The network appears highly organized and spans multiple states."
]

for i in range(1, 31):
    template = random.choice(fir_templates)
    
    # Pick a random pairing based on template context
    if "narcotics" in template or "ganja" in template:
        acc1 = network_nodes['vikram_sharma']
        acc2 = network_nodes['deepak_chauhan']
    elif "hawala" in template or "shell company" in template:
        acc1 = network_nodes['suresh_agarwal']
        acc2 = network_nodes['deepak_chauhan']
    elif "hafta" in template or "extortion" in template:
        acc1 = network_nodes['mohammed_irfan']
        acc2 = network_nodes['deepak_chauhan']
    else:
        acc1 = random.choice(list(network_nodes.values()))
        acc2 = random.choice([n for k, n in network_nodes.items() if n != acc1])
        
    fir_text = template.format(
        fir_num=f"{random.randint(100, 999)}",
        ps=f"{random.choice(cities)} Central",
        dist=random.choice(cities),
        date=random_date(start_date, end_date).strftime('%Y-%m-%d'),
        city=random.choice(cities),
        vehicle=random.choice(acc1['vehicles'] + acc2['vehicles']),
        accused1=acc1['name'],
        accused2=acc2['name'],
        phone=random.choice(acc1['phones'] + acc2['phones']),
        account=random.choice(acc1['accounts'] + acc2['accounts']),
        bank=random.choice(banks)
    )
    
    with open(os.path.join(FIRS_DIR, f'FIR_{i:03d}.txt'), 'w', encoding='utf-8') as f:
        f.write(fir_text)

# 2. Generate CDR CSV (500 rows)
print("Generating CDRs...")
cdr_file = os.path.join(DATA_DIR, 'cdr_records.csv')
with open(cdr_file, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['caller', 'receiver', 'timestamp', 'duration_seconds', 'cell_tower'])
    
    all_phones = []
    for node in network_nodes.values():
        all_phones.extend(node['phones'])
        
    for _ in range(500):
        # Mostly communication between Deepak and others (broker logic)
        if random.random() < 0.6:
            caller = random.choice(network_nodes['deepak_chauhan']['phones'])
            receiver = random.choice([p for p in all_phones if p not in network_nodes['deepak_chauhan']['phones']])
        else:
            caller = random.choice(all_phones)
            receiver = random.choice([p for p in all_phones if p != caller])
            
        timestamp = random_date(start_date, end_date).strftime('%Y-%m-%d %H:%M:%S')
        duration = random.randint(10, 1200)
        tower = random.choice(cities)
        
        writer.writerow([caller, receiver, timestamp, duration, tower])

# 3. Generate Financial CSV (200 rows)
print("Generating Financial records...")
fin_file = os.path.join(DATA_DIR, 'financial_transactions.csv')
with open(fin_file, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['sender_account', 'sender_name', 'receiver_account', 'receiver_name', 'amount', 'timestamp', 'purpose', 'bank'])
    
    purposes = ['business payment', 'loan repayment', 'gift', 'property', 'investment', 'consultation fee']
    
    for _ in range(200):
        # High flow through Suresh Agarwal
        if random.random() < 0.5:
            sender = random.choice(list(network_nodes.values()))
            receiver = network_nodes['suresh_agarwal']
        elif random.random() < 0.5:
            sender = network_nodes['suresh_agarwal']
            receiver = random.choice(list(network_nodes.values()))
        else:
            sender = random.choice(list(network_nodes.values()))
            receiver = random.choice([n for n in network_nodes.values() if n != sender])
            
        s_acc = random.choice(sender['accounts'])
        r_acc = random.choice(receiver['accounts'])
        amount = random.randint(5000, 5000000)
        timestamp = random_date(start_date, end_date).strftime('%Y-%m-%d %H:%M:%S')
        purpose = random.choice(purposes)
        bank = random.choice(banks)
        
        writer.writerow([s_acc, sender['name'], r_acc, receiver['name'], amount, timestamp, purpose, bank])

# 4. Generate Vehicle CSV (100 rows)
print("Generating Vehicle Sightings...")
veh_file = os.path.join(DATA_DIR, 'vehicle_sightings.csv')
with open(veh_file, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['plate_number', 'location', 'timestamp', 'camera_id'])
    
    all_vehicles = []
    for node in network_nodes.values():
        all_vehicles.extend(node['vehicles'])
        
    for _ in range(100):
        plate = random.choice(all_vehicles)
        loc = random.choice(cities)
        timestamp = random_date(start_date, end_date).strftime('%Y-%m-%d %H:%M:%S')
        camera = f"CAM-{random.randint(100,999)}"
        
        writer.writerow([plate, loc, timestamp, camera])

print("Synthetic data generation complete!")
