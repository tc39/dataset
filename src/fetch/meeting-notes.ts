import { readFile, readdir } from 'node:fs/promises';

const contents = new Map<string, string>();
export async function readAllMeetingNotes() {
  if (contents.size) return contents;

  const result = await readdir(`notes/meetings`);

  const fileToRead: string[] = [];
  for (const date of result) {
    // notes before 2016 does not have a [proposal](link) field.
    if (parseFloat(date) < 2016) continue;
    for (const file of await readdir(`notes/meetings/${date}`)) {
      if (!file.endsWith('.md')) continue;

      fileToRead.push(`notes/meetings/${date}/${file}`);
    }
  }
  await Promise.all(
    fileToRead.map(async (file) => {
      contents.set(file, await readFile(file, 'utf-8'));
    }),
  );
  return contents;
}

export async function findURLPresentInMeetingNotes(url: string): Promise<[string, Date][]> {
  const notes = await readAllMeetingNotes();
  return Array.from(notes)
    .filter((x) => x[1].includes(url))
    .map((x) => x[0])
    .map(pathToURL_DatePair)
    .filter((x) => !Number.isNaN(x[1].valueOf()));
}

function pathToURL_DatePair(path: string): [string, Date] {
  // notes/meetings/2022/01/jan-12.md
  console.assert(path.startsWith('notes/meetings/'));
  const [_, __, yearMonth, monthDay] = path.split('/');
  const [year, month] = yearMonth.split('-');
  const [month2, dayInMonth] = monthDay.slice(0, -3).split('-');

  console.log(year, month, dayInMonth);
  const date = new Date(`${year}-${month}-${dayInMonth}`);
  return [`https://github.com/tc39/notes/blob/HEAD/meetings/${yearMonth}/${monthDay}`, date];
}
