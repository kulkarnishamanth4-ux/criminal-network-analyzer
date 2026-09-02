import codecs

with codecs.open('backend/main.py', 'r', 'utf-8') as f:
    content = f.read()

content = content.replace("seed_dawood_case()", "# seed_dawood_case() removed to prevent infinite duplication on reboot")
content = content.replace("seed_additional_cases(db)", "# seed_additional_cases(db) removed to prevent infinite duplication on reboot")

with codecs.open('backend/main.py', 'w', 'utf-8') as f:
    f.write(content)
print("main.py fixed.")
