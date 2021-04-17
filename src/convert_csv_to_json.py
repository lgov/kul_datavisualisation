import os
from glob import glob
from os.path import splitext

import pandas as pd

# run this script from the project root folder

for f in glob('docs/*.csv'):
    print("Read file %s and convert to json" % f)
    df = pd.read_csv(f)
    name, _ = splitext(os.path.basename(f))
    df.to_json(os.path.join('data', name + '.json'))

for f in glob('docs/*.xlsx'):
    print("Read file %s and convert to json" % f)
    df = pd.read_excel(f)
    name, _ = splitext(os.path.basename(f))
    df.to_json(os.path.join('data', name + '.json'))
