type StudentSeatStatus = 'available' | 'window' | 'taken' | 'selected' | 'disabled';

const STUDENT_SEAT_ROWS: StudentSeatStatus[][] = [
  ['available', 'available', 'taken', 'available', 'taken', 'available', 'available', 'available'],
  ['window', 'window', 'window', 'window', 'window', 'window', 'window', 'window'],
  ['taken', 'available', 'selected', 'taken', 'available', 'taken', 'available', 'taken'],
  ['available', 'taken', 'available', 'available', 'available', 'taken', 'available', 'available'],
  ['available', 'available', 'taken', 'taken', 'available', 'available', 'taken', 'available'],
  ['taken', 'available', 'available', 'available', 'taken', 'available', 'available', 'taken'],
  ['disabled', 'disabled', 'available', 'taken', 'available', 'available', 'taken', 'disabled']
];

export type SeedSeatFixture = {
  id: string;
  roomId: string;
  code: string;
  x: number;
  y: number;
  hasPower: boolean;
  nearWindow: boolean;
};

export function createStudentRoomSeatFixtures(roomIds: readonly string[]): SeedSeatFixture[] {
  return roomIds.flatMap((roomId) =>
    STUDENT_SEAT_ROWS.flatMap((row, rowIndex) =>
      row.flatMap((status, colIndex) => {
        if (status === 'taken' || status === 'disabled') return [];
        const code = `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
        return {
          id: `seat-${roomId.replace(/^room-/, '')}-${code.toLowerCase()}`,
          roomId,
          code,
          x: colIndex + 1,
          y: rowIndex + 1,
          hasPower: [0, 2, 4].includes(rowIndex),
          nearWindow: status === 'window'
        };
      })
    )
  );
}
