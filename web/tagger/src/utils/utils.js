export function classes(classes) {
  const joined = classes.join(" ");
  return joined;
}

export function parseCsvFile(text) {
  const lines = text.split(/\r\n|\n/);
  const headers = lines[0].split(',');

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const data = lines[i].split(',');
    if (data.length === headers.length) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[j];
      }
      rows.push(row);
    }
  }
  return rows
}
