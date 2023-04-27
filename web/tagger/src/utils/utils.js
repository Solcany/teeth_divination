export function classes(classes) {
  const joined = classes.join(" ");
  return joined;
}

export function parseCsvFile(text) {
  const lines = text.split(/\r\n|\n/);
  const headers = lines[0].split(',');
  const rows_length = lines.length - 1; // ignore the headeer
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const re_row = /(?:"[^"]*"|[^,])+/g; // take " , " into accounts when splitting
    const matched = lines[i].match(re_row);
    if(matched) {
      let row_data = new Array(headers.length).fill("")
      for (let s = 0; s < matched.length; s++) {
        row_data[s] = matched[s]
      }
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = row_data[j];
      }
      rows.push(row);
    }
  }
  return rows
}
