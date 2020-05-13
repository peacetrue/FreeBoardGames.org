import { Room } from './Room';

export interface CheckinRoomResponse {
  // This is populated only when the match started.
  matchId?: string;
  room: Room;
}
