import { Controller, Get, Post, Delete, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AdminGuard } from './admin.guard';
import { FamilyEntity } from '../family.entity';
import { PersonEntity } from '../person.entity';
import { ApprovalRequestEntity } from '../approval-request.entity';
import { GotraConfigEntity } from '../config/gotra-config.entity';
import { SiteConfigEntity } from '../config/site-config.entity';
import { UserEntity } from '../users/user.entity';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    @InjectRepository(FamilyEntity) private families: Repository<FamilyEntity>,
    @InjectRepository(PersonEntity) private people: Repository<PersonEntity>,
    @InjectRepository(ApprovalRequestEntity) private approvals: Repository<ApprovalRequestEntity>,
    @InjectRepository(GotraConfigEntity) private gotras: Repository<GotraConfigEntity>,
    @InjectRepository(SiteConfigEntity) private configs: Repository<SiteConfigEntity>,
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
  ) {}

  // ── Dashboard stats ────────────────────────────────────────────────────────
  @Get('stats')
  async stats() {
    const [totalFamilies, totalPeople, totalApprovals, pendingApprovals, totalUsers, activeUsers] = await Promise.all([
      this.families.count(),
      this.people.count(),
      this.approvals.count(),
      this.approvals.count({ where: { status: 'pending' } }),
      this.users.count(),
      this.users.count({ where: { status: 'active' } }),
    ]);
    const [recentFamilies, recentPeople] = await Promise.all([
      this.families.find({ order: { createdAt: 'DESC' }, take: 6 }),
      this.people.find({ order: { createdAt: 'DESC' }, take: 6 }),
    ]);

    // Attach family names to recent people
    const famIds = [...new Set(recentPeople.map(p => p.familyId))];
    const fams = famIds.length ? await this.families.find({ where: { id: In(famIds) } }) : [];
    const famMap = new Map(fams.map(f => [f.id, f.name]));

    return {
      totalFamilies,
      totalPeople,
      totalApprovals,
      pendingApprovals,
      totalUsers,
      activeUsers,
      recentFamilies,
      recentPeople: recentPeople.map(p => ({ ...p, familyName: famMap.get(p.familyId) || 'Unknown' })),
    };
  }

  // ── Families ───────────────────────────────────────────────────────────────
  @Get('families')
  async getFamilies(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search = '',
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const qb = this.families.createQueryBuilder('f');
    if (search) {
      qb.where('(f.name LIKE :s OR f.ancestralVillage LIKE :s OR f.founderId LIKE :s)', { s: `%${search}%` });
    }
    qb.orderBy('f.createdAt', 'DESC').skip(skip).take(take);
    const [items, total] = await qb.getManyAndCount();

    // People count per family in one query
    const familyIds = items.map(f => f.id);
    const peopleMeta = familyIds.length
      ? await this.people.find({ select: ['id', 'familyId'], where: { familyId: In(familyIds) } })
      : [];
    const countMap = new Map<string, number>();
    for (const p of peopleMeta) countMap.set(p.familyId, (countMap.get(p.familyId) || 0) + 1);

    return {
      items: items.map(f => ({ ...f, peopleCount: countMap.get(f.id) || 0 })),
      total,
      page: Number(page),
      limit: take,
    };
  }

  @Patch('families/:id')
  async patchFamily(
    @Param('id') id: string,
    @Body() body: { isActive?: boolean; name?: string },
  ) {
    const family = await this.families.findOne({ where: { id } });
    if (!family) return { error: 'Not found' };
    if (body.isActive !== undefined) family.isActive = body.isActive;
    if (body.name) family.name = body.name;
    return this.families.save(family);
  }

  @Delete('families/:id')
  async deleteFamily(@Param('id') id: string) {
    await this.families.softDelete(id);
    return { success: true };
  }

  // ── People ─────────────────────────────────────────────────────────────────
  @Get('people')
  async getPeople(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('familyId') familyId = '',
    @Query('search') search = '',
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const qb = this.people.createQueryBuilder('p');
    if (familyId) qb.andWhere('p.familyId = :fid', { fid: familyId });
    if (search) {
      qb.andWhere('(p.firstName LIKE :s OR p.lastName LIKE :s OR p.gotra LIKE :s)', { s: `%${search}%` });
    }
    qb.orderBy('p.createdAt', 'DESC').skip(skip).take(take);
    const [items, total] = await qb.getManyAndCount();

    // Attach family names
    const famIds = [...new Set(items.map(p => p.familyId))];
    const fams = famIds.length ? await this.families.find({ where: { id: In(famIds) } }) : [];
    const famMap = new Map(fams.map(f => [f.id, f.name]));

    return {
      items: items.map(p => ({ ...p, familyName: famMap.get(p.familyId) || 'Unknown' })),
      total,
      page: Number(page),
      limit: take,
    };
  }

  @Delete('people/:id')
  async deletePerson(@Param('id') id: string) {
    await this.people.softDelete(id);
    return { success: true };
  }

  // ── Gotras ─────────────────────────────────────────────────────────────────
  @Get('gotras')
  async getGotras(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('search') search = '',
  ) {
    const take = Math.min(Number(limit) || 50, 200);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const qb = this.gotras.createQueryBuilder('g');
    if (search) {
      qb.where('(g.gotra LIKE :s OR g.nepali LIKE :s)', { s: `%${search}%` });
    }
    qb.orderBy('g.sortOrder', 'ASC').addOrderBy('g.gotra', 'ASC').skip(skip).take(take);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page: Number(page), limit: take };
  }

  @Post('gotras')
  async createGotra(@Body() body: { gotra: string; nepali: string; surnames: string[]; sortOrder?: number }) {
    const entity = this.gotras.create({
      gotra: body.gotra.toUpperCase().trim(),
      nepali: body.nepali.trim(),
      surnames: body.surnames || [],
      sortOrder: body.sortOrder ?? 99,
    });
    return this.gotras.save(entity);
  }

  @Patch('gotras/:id')
  async updateGotra(
    @Param('id') id: string,
    @Body() body: { gotra?: string; nepali?: string; surnames?: string[]; sortOrder?: number },
  ) {
    const entity = await this.gotras.findOne({ where: { id } });
    if (!entity) return { error: 'Not found' };
    if (body.gotra !== undefined)    entity.gotra    = body.gotra.toUpperCase().trim();
    if (body.nepali !== undefined)   entity.nepali   = body.nepali.trim();
    if (body.surnames !== undefined) entity.surnames = body.surnames;
    if (body.sortOrder !== undefined) entity.sortOrder = body.sortOrder;
    return this.gotras.save(entity);
  }

  @Delete('gotras/:id')
  async deleteGotra(@Param('id') id: string) {
    await this.gotras.delete(id);
    return { success: true };
  }

  // ── Site Config ────────────────────────────────────────────────────────────
  @Get('config')
  async getConfig() {
    const rows = await this.configs.find();
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
  }

  @Patch('config')
  async updateConfig(@Body() body: Record<string, string>) {
    for (const [key, value] of Object.entries(body)) {
      let row = await this.configs.findOne({ where: { key } });
      if (!row) row = this.configs.create({ key });
      row.value = String(value);
      await this.configs.save(row);
    }
    const rows = await this.configs.find();
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
  }

  // ── Users ──────────────────────────────────────────────────────────────────
  @Get('users')
  async getUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search = '',
    @Query('status') status = '',
    @Query('role') role = '',
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const qb = this.users.createQueryBuilder('u').withDeleted();
    if (search) {
      qb.andWhere(
        '(u.email LIKE :s OR u.firstName LIKE :s OR u.lastName LIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (status) qb.andWhere('u.status = :status', { status });
    if (role)   qb.andWhere('u.role = :role', { role });
    qb.orderBy('u.createdAt', 'DESC').skip(skip).take(take);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page: Number(page), limit: take };
  }

  @Post('users')
  async createUser(
    @Body() body: { email: string; firstName?: string; lastName?: string; role?: string; status?: string; phone?: string },
  ) {
    const exists = await this.users.findOne({ where: { email: body.email } });
    if (exists) return { error: 'User with this email already exists' };
    const user = this.users.create({
      email: body.email.trim().toLowerCase(),
      firstName: body.firstName?.trim(),
      lastName: body.lastName?.trim(),
      role: body.role || 'member',
      status: body.status || 'active',
      phone: body.phone?.trim(),
    });
    return this.users.save(user);
  }

  @Patch('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: { email?: string; firstName?: string; lastName?: string; role?: string; status?: string; phone?: string },
  ) {
    const user = await this.users.findOne({ where: { id }, withDeleted: true });
    if (!user) return { error: 'Not found' };
    if (body.email)     user.email     = body.email.trim().toLowerCase();
    if (body.firstName !== undefined) user.firstName = body.firstName.trim();
    if (body.lastName  !== undefined) user.lastName  = body.lastName.trim();
    if (body.role)   user.role   = body.role;
    if (body.status) user.status = body.status;
    if (body.phone !== undefined) user.phone = body.phone.trim();
    user.deletedAt = undefined;
    return this.users.save(user);
  }

  @Post('users/:id/reset')
  async resetUserSettings(@Param('id') id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) return { error: 'Not found' };
    user.preferences = undefined;
    return this.users.save(user);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    await this.users.softDelete(id);
    return { success: true };
  }
}
