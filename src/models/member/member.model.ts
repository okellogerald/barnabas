import { MemberDTO, UpdateMemberDTO } from "@/data/member";
import { Dependant } from "./dependant.model";

/**
 * Member model representing a church member
 */
export class Member {
  id: string;
  churchId: string;
  envelopeNumber: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: string;
  dateOfBirth: Date | null;
  placeOfBirth: string | null;
  profilePhoto: string | null;
  maritalStatus: string;
  marriageType: string | null;
  dateOfMarriage: Date | null;
  spouseName: string | null;
  placeOfMarriage: string | null;
  phoneNumber: string;
  email: string | null;
  spousePhoneNumber: string | null;
  residenceNumber: string | null;
  residenceBlock: string | null;
  postalBox: string | null;
  residenceArea: string | null;
  formerChurch: string | null;
  occupation: string | null;
  placeOfWork: string | null;
  educationLevel: string;
  profession: string | null;
  memberRole: string;
  isBaptized: boolean;
  isConfirmed: boolean;
  partakesLordSupper: boolean;
  fellowshipId: string | null;
  nearestMemberName: string | null;
  nearestMemberPhone: string | null;
  attendsFellowship: boolean;
  fellowshipAbsenceReason: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Related entities
  dependants: Dependant[];
  interests: any[]; // For simplicity, we're keeping this as 'any' for now

  constructor(dto: MemberDTO) {
    this.id = dto.id;
    this.churchId = dto.churchId;
    this.envelopeNumber = dto.envelopeNumber;
    this.firstName = dto.firstName;
    this.middleName = dto.middleName;
    this.lastName = dto.lastName;
    this.gender = dto.gender;
    this.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    this.placeOfBirth = dto.placeOfBirth;
    this.profilePhoto = dto.profilePhoto;
    this.maritalStatus = dto.maritalStatus;
    this.marriageType = dto.marriageType;
    this.dateOfMarriage = dto.dateOfMarriage
      ? new Date(dto.dateOfMarriage)
      : null;
    this.spouseName = dto.spouseName;
    this.placeOfMarriage = dto.placeOfMarriage;
    this.phoneNumber = dto.phoneNumber;
    this.email = dto.email;
    this.spousePhoneNumber = dto.spousePhoneNumber;
    this.residenceNumber = dto.residenceNumber;
    this.residenceBlock = dto.residenceBlock;
    this.postalBox = dto.postalBox;
    this.residenceArea = dto.residenceArea;
    this.formerChurch = dto.formerChurch;
    this.occupation = dto.occupation;
    this.placeOfWork = dto.placeOfWork;
    this.educationLevel = dto.educationLevel;
    this.profession = dto.profession;
    this.memberRole = dto.memberRole;
    this.isBaptized = Boolean(dto.isBaptized);
    this.isConfirmed = Boolean(dto.isConfirmed);
    this.partakesLordSupper = Boolean(dto.partakesLordSupper);
    this.fellowshipId = dto.fellowshipId;
    this.nearestMemberName = dto.nearestMemberName;
    this.nearestMemberPhone = dto.nearestMemberPhone;
    this.attendsFellowship = Boolean(dto.attendsFellowship);
    this.fellowshipAbsenceReason = dto.fellowshipAbsenceReason;
    this.createdAt = new Date(dto.createdAt);
    this.updatedAt = new Date(dto.updatedAt);

    // Handle related collections
    this.dependants = dto.dependants?.map((d) => Dependant.fromDTO(d)) || [];
    this.interests = dto.interests || [];
  }

  /**
   * Gets the full name of the member
   */
  getFullName(): string {
    if (this.middleName) {
      return `${this.firstName} ${this.middleName} ${this.lastName}`;
    }
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Gets the member's age in years
   */
  getAge(): number | null {
    if (!this.dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Gets a summary of the member's dependants
   */
  getDependantsSummary(): string {
    if (this.dependants.length === 0) {
      return "No dependants";
    }

    return `${this.dependants.length} dependant(s)`;
  }

  /**
   * Gets a summary of fellowship attendance
   */
  getFellowshipStatusSummary(): string {
    if (!this.fellowshipId) {
      return "Not assigned to a fellowship";
    }

    if (this.attendsFellowship) {
      return "Attends fellowship regularly";
    }

    return this.fellowshipAbsenceReason || "Does not attend fellowship";
  }

  /**
   * Factory method to create a Member from a DTO
   */
  static fromDTO(dto: MemberDTO): Member {
    return new Member(dto);
  }

  /**
   * Converts the model back to a DTO
   */
  toDTO(): MemberDTO {
    return {
      id: this.id,
      churchId: this.churchId,
      envelopeNumber: this.envelopeNumber,
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      gender: this.gender as any,
      dateOfBirth: this.dateOfBirth ? this.dateOfBirth.toISOString() : null,
      placeOfBirth: this.placeOfBirth,
      profilePhoto: this.profilePhoto,
      maritalStatus: this.maritalStatus as any,
      marriageType: this.marriageType as any,
      dateOfMarriage: this.dateOfMarriage
        ? this.dateOfMarriage.toISOString()
        : null,
      spouseName: this.spouseName,
      placeOfMarriage: this.placeOfMarriage,
      phoneNumber: this.phoneNumber,
      email: this.email,
      spousePhoneNumber: this.spousePhoneNumber,
      residenceNumber: this.residenceNumber,
      residenceBlock: this.residenceBlock,
      postalBox: this.postalBox,
      residenceArea: this.residenceArea,
      formerChurch: this.formerChurch,
      occupation: this.occupation,
      placeOfWork: this.placeOfWork,
      educationLevel: this.educationLevel as any,
      profession: this.profession,
      memberRole: this.memberRole as any,
      isBaptized: this.isBaptized,
      isConfirmed: this.isConfirmed,
      partakesLordSupper: this.partakesLordSupper,
      fellowshipId: this.fellowshipId,
      nearestMemberName: this.nearestMemberName,
      nearestMemberPhone: this.nearestMemberPhone,
      attendsFellowship: this.attendsFellowship,
      fellowshipAbsenceReason: this.fellowshipAbsenceReason,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      dependants: this.dependants.map((d) => d.toDTO()),
      interests: this.interests,
    };
  }

  /**
   * Creates a DTO for updating this member
   */
  toUpdateDTO(): UpdateMemberDTO {
    // Return only the fields that can be updated
    return {
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      gender: this.gender as any,
      dateOfBirth: this.dateOfBirth ? this.dateOfBirth.toISOString() : null,
      placeOfBirth: this.placeOfBirth,
      profilePhoto: this.profilePhoto,
      maritalStatus: this.maritalStatus as any,
      marriageType: this.marriageType as any,
      dateOfMarriage: this.dateOfMarriage
        ? this.dateOfMarriage.toISOString()
        : null,
      spouseName: this.spouseName,
      placeOfMarriage: this.placeOfMarriage,
      phoneNumber: this.phoneNumber,
      email: this.email,
      spousePhoneNumber: this.spousePhoneNumber,
      residenceNumber: this.residenceNumber,
      residenceBlock: this.residenceBlock,
      postalBox: this.postalBox,
      residenceArea: this.residenceArea,
      formerChurch: this.formerChurch,
      occupation: this.occupation,
      placeOfWork: this.placeOfWork,
      educationLevel: this.educationLevel as any,
      profession: this.profession,
      memberRole: this.memberRole as any,
      isBaptized: this.isBaptized,
      isConfirmed: this.isConfirmed,
      partakesLordSupper: this.partakesLordSupper,
      fellowshipId: this.fellowshipId,
      nearestMemberName: this.nearestMemberName,
      nearestMemberPhone: this.nearestMemberPhone,
      attendsFellowship: this.attendsFellowship,
      fellowshipAbsenceReason: this.fellowshipAbsenceReason,
      dependants: this.dependants.map((d) => ({
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        dateOfBirth: d.dateOfBirth ? d.dateOfBirth.toISOString() : null,
        relationship: d.relationship as any,
      })),
      interests: this.interests.map((i) => i.id),
    };
  }
}
