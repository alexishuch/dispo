import { IAvailability } from "src/availabilities/models/availabilities.interface";

export interface IParticipant {
  id: string;
  name: string;
}

export interface IParticipantWithAvailabilities extends IParticipant {
  availabilities: IAvailability[];
}

export interface ICreateParticipant extends Pick<IParticipant, 'name'> {
  pollId: string;
}