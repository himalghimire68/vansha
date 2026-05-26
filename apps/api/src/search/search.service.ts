import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PersonEntity } from '../person.entity';

export interface SearchResult {
  id: string;
  firstName: string;
  lastName: string;
  nepaliName?: string;
  gotra?: string;
  ancestralVillage?: string;
  familyId: string;
  type: string;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(PersonEntity)
    private personRepository: Repository<PersonEntity>,
    private configService: ConfigService,
  ) {}

  async searchPeople(familyId: string, query: string, limit = 20): Promise<SearchResult[]> {
    if (!query?.trim()) return [];

    const people = await this.personRepository.find({
      where: [
        { familyId, firstName: ILike(`%${query}%`) },
        { familyId, lastName: ILike(`%${query}%`) },
        { familyId, nepaliName: ILike(`%${query}%`) },
      ],
      take: limit,
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    return people.map((p) => this.toResult(p));
  }

  async searchByLocation(familyId: string, location: string): Promise<SearchResult[]> {
    if (!location?.trim()) return [];

    const people = await this.personRepository.find({
      where: [
        { familyId, ancestralVillage: ILike(`%${location}%`) },
        { familyId, ancestralDistrict: ILike(`%${location}%`) },
        { familyId, ancestralProvince: ILike(`%${location}%`) },
      ],
      take: 50,
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    return people.map((p) => this.toResult(p));
  }

  async searchByGotra(familyId: string, gotra: string): Promise<SearchResult[]> {
    if (!gotra?.trim()) return [];

    const people = await this.personRepository.find({
      where: { familyId, gotra: ILike(`%${gotra}%`) },
      take: 50,
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    return people.map((p) => this.toResult(p));
  }

  async indexPerson(person: PersonEntity): Promise<void> {
    // No-op in SQL mode — data is already searchable via LIKE queries
  }

  private toResult(p: PersonEntity): SearchResult {
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      nepaliName: p.nepaliName,
      gotra: p.gotra,
      ancestralVillage: p.ancestralVillage,
      familyId: p.familyId,
      type: 'person',
    };
  }
}
