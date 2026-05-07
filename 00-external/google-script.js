function doPost(e)
{
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("Diamond Painting");

  const data = JSON.parse(e.postData.contents);

  if (data.action === "edit")
  {
    return handleEdit(sheet, data);
  }

  return handleAdd(sheet, data);
}

function handleAdd(sheet, data)
{
  sheet.appendRow
  ([
    data.id,
    data.name,
    data.width,
    data.height,
    data.owner,
    data.finished,
    data.sizem2,
    data.ab,
    data.fd,
    data.comment,
    data.imgoriginal,
    data.imgfinished
  ]);

  return ContentService
    .createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}

function handleEdit(sheet, data)
{
  const ids = sheet.getRange("A:A").getValues();

  let rowIndex = -1;

  for (let i = 0; i < ids.length; i++)
  {
    if (String(ids[i][0]) === String(data.id))
    {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1)
  {
    return ContentService
      .createTextOutput("NOT_FOUND")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  const rowRange = sheet.getRange(rowIndex, 1, 1, 12);
  const row = rowRange.getValues()[0];

  row[1] = data.name;
  row[2] = data.width;
  row[3] = data.height;
  row[4] = data.owner;
  // row[5] = Finished — preserved
  row[6] = data.sizem2;
  row[7] = data.ab;
  row[8] = data.fd;
  row[9] = data.comment;
  row[10] = data.imgoriginal;
  row[11] = data.imgfinished;

  rowRange.setValues([row]);

  return ContentService
    .createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}
