import cheerio from 'cheerio';
import _ from 'lodash-es';

export function* parseHTML(input: string, renameHeader: (name: string) => string = _.identity) {
  const $ = cheerio.load(input);

  function* buildHeaders(element: cheerio.Element) {
    for (const cell of $('tr th', element).toArray()) {
      yield renameHeader($(cell).text().trim());
    }
  }

  function* buildRow(row: cheerio.Element): Generator<Field> {
    for (const cell of $('td', row).toArray()) {
      const text = $(cell).text().trim();
      const links = _.chain($('a', cell).toArray())
        .map((element) => [$(element).text().trim(), $(element).attr('href')?.trim()])
        .fromPairs()
        .value();
      yield { text, links };
    }
  }

  function* buildRows(headers: string[], rows: cheerio.Element[]): Generator<Record<string, Field | undefined>> {
    for (let index = 1; index < rows.length; index++) {
      const fields = Array.from(buildRow(rows[index]));
      yield _.fromPairs(fields.map((value, i) => [headers[i], value]));
    }
  }

  for (const element of $('table').toArray()) {
    yield buildRows(Array.from(buildHeaders(element)), $('tr', element).toArray());
  }
}

interface Field {
  text: string;
  links: Record<string, string>;
}
