import { expect, test } from 'bun:test';
import { composeDescription } from './composeDescription';

function createStrongHelper(key: number, content: string) {
  return (
    <strong key={key} style={{ textDecoration: 'underline' }}>
      {content}
    </strong>
  );
}

test('Return description as is', () => {
  const input = 'This is a test description';

  const expectedOutput = 'This is a test description';

  expect(composeDescription(input)).toStrictEqual(expectedOutput);
});

test('Replace highlight with <strong>', () => {
  const input = 'This is a @@@test@@@ description';

  const expectedOutput = ['This is a ', createStrongHelper(10, 'test'), ' description'];
  expect(composeDescription(input)).toStrictEqual(expectedOutput);
});

test('Replace highlight with <strong> (multiple matches)', () => {
  const input = 'This is a @@@test@@@ description, with more @@@test@@@ highlights';

  const expectedOutput = [
    'This is a ',
    createStrongHelper(10, 'test'),
    ' description, with more ',
    createStrongHelper(44, 'test'),
    ' highlights',
  ];

  expect(composeDescription(input)).toStrictEqual(expectedOutput);
});

test('Replace highlight with <strong> (multiple, different matches)', () => {
  const input = 'This is a @@@test@@@ description, with @@@more@@@ test highlights';

  const expectedOutput = [
    'This is a ',
    createStrongHelper(10, 'test'),
    ' description, with ',
    createStrongHelper(39, 'more'),
    ' test highlights',
  ];

  expect(composeDescription(input)).toStrictEqual(expectedOutput);
});
