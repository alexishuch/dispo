export interface IPoll {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface IPollEnriched extends IPoll {
  participants: IParticipant[];
  commonSlots: ICommonSlot[];
}

export interface ICreatePoll {
  name: string;
  start_date?: string;
  end_date?: string;
}

export interface ICommonSlot {
  start_date: string;
  end_date: string;
  count: number;
  participants_names: string[];
}

export interface IParticipant {
  id: string;
  name: string;
}

export interface IParticipantEnriched extends IParticipant {
  availabilities: IAvailability[];
}

// export interface ICreateParticipant extends Pick<IParticipant, 'name'> {
//     pollId: string;
// }

export interface IAvailability {
  id: string;
  slot_start: string;
  slot_end: string;
  participantId?: string;
  zonedDate?: string;
}

export interface ICreateAvailability extends Omit<IAvailability, 'id'> {}
