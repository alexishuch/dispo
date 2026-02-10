export interface IPoll {
    id: string;
    name: string;
    start_date?: Date;
    end_date?: Date;
    created_at: Date;
}

export interface IPollEnriched {
    participants: IParticipant[];
    commonSlots: ICommonSlot[];
}

export interface ICreatePoll {
    name: string;
    start_date?: Date;
    end_date?: Date;
}

export interface ICommonSlot {
    start_date: Date;
    end_date: Date;
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
    slot_start: Date;
    slot_end: Date;
    participantId?: string;
}

// export interface ICreateAvailability extends Omit<IAvailability, 'id'> { }