from pathlib import Path
path = Path('src/base modelo/BACKLOG SP2 C.8 (1) (2).xlsx')
print('exists', path.exists())
try:
    import openpyxl
except Exception as e:
    print('openpyxl missing', e)
    raise
wb = openpyxl.load_workbook(path, read_only=True)
sheet = wb.active
print('sheet', sheet.title)
for i, row in enumerate(sheet.iter_rows(values_only=True), 1):
    print(i, row)
    if i >= 10:
        break
