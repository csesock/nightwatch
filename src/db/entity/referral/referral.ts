import { IsDate, IsFQDN, IsNumber } from 'class-validator'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn
} from 'typeorm'
import { Guild, ReferralRole, ReferralUnlockedReward, User } from '..'

@Entity()
export class Referral {
  /**
   * The date the referral was created.
   */
  @Column()
  @IsDate()
  public readonly dateCreated: Date

  /**
   * The Guild the referral belongs to.
   */
  @ManyToOne(_ => Guild)
  public readonly guild: Guild
  /**
   * Referral ID. Not auto-generated.
   * Should be generated in the implementation. Ideally, it should only be 4-6 digits long.
   */
  @PrimaryColumn()
  public readonly id: number

  /**
   * Discord invite link.
   */
  @Column('varchar')
  @IsFQDN()
  public readonly inviteUrl: string

  /**
   * Number of times people joined using the referral link.
   */
  @Column()
  @IsNumber()
  public readonly joinCount: number

  /**
   * The role that is given to each user that joins via the referral link.
   */
  @OneToOne(_ => ReferralRole, referralRole => referralRole.referral, {
    cascade: true
  })
  public readonly role: ReferralRole

  @OneToMany(
    _ => ReferralUnlockedReward,
    unlockedReward => unlockedReward.referral,
    {
      cascade: true
    }
  )
  public readonly unlockedRewards: ReadonlyArray<ReferralUnlockedReward>

  /**
   * User that created the referral. They will be known as the referral owner.
   */
  @ManyToOne(_ => User)
  public readonly user: User

  public constructor(referral?: Referral) {
    if (referral) {
      Object.assign(this, referral)
    }

    this.dateCreated = new Date()
  }
}
