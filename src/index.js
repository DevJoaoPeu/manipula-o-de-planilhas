const reader = require('xlsx');

const file = process.argv[2];

const read = reader.readFile(file)

const sheets = read.SheetNames

for(let i = 0; i < sheets.length; i++){
  const data = reader.utils.sheet_to_json(read.Sheets[read.SheetNames[i]])

  data.forEach(res => {
    console.log(res)
  }
  )
}