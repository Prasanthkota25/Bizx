import { isSearchReady, searchLeaveRecords } from './searchUtils';

describe('searchUtils', () => {
  it('requires at least three characters before searching', () => {
    expect(isSearchReady('ab')).toBe(false);
    expect(isSearchReady('abc')).toBe(true);
    expect(isSearchReady('  abc  ')).toBe(true);
  });

  it('filters leave records by a case-insensitive search term', () => {
    const records = [
      { username: 'Alice', leaveType: 'Sick Leave', reason: 'Fever' },
      { username: 'Bob', leaveType: 'Casual Leave', reason: 'Family Visit' },
      { username: 'Charlie', leaveType: 'Earned Leave', reason: 'Trip' }
    ];

    const result = searchLeaveRecords(records, 'ALICE');

    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('Alice');
  });
});
