import { Response } from 'express'
import {
  controller,
  httpGet,
  httpDelete,
  httpPut,
  httpPost,
  requestParam,
  requestBody,
  response
} from 'inversify-express-utils'
import { inject } from 'inversify'
import { GuildService } from '../services/guild'
import { SocketService } from '../services/socket'
import { BaseController } from '../interfaces/base-controller'
import {
  Guild,
  GuildSupportTicket,
  GuildSettings,
  GuildUser,
  GuildSuggestion,
  GuildSelfAssignableRole,
  Song
} from '../../../db'
import { Types } from '../../../common'
import {
  GuildSupportTicketEvent,
  GuildSuggestionEvent,
  GuildEvent,
  GuildUserEvent,
  GuildSettingsEvent
} from '../constants/events'

/**
 * The Guild controller. Contains all endpoints for handling Guilds and Guild data.
 *
 * /api/guilds
 * @class GuildController
 */
@controller('/api/guilds')
export class GuildController implements BaseController<Guild, string> {
  @inject(Types.GuildService) private readonly guildService: GuildService
  @inject(Types.SocketService) private readonly socketService: SocketService

  /**
   * Gets all guilds from the database, excluding most guild information.
   *
   * GET /
   * @returns Promise<Guild[]>
   * @memberof GuildController
   */
  @httpGet('/')
  public async find() {
    return this.guildService.find()
  }

  /**
   * Gets a guild by their ID, including all guild information.
   *
   * GET /:id
   * @param {string} id The ID of the guild.
   * @returns Promise<Guild>
   * @memberof GuildController
   */
  @httpGet('/:id')
  public async findById(
    @requestParam('id') id: string,
    @response() res: Response
  ) {
    const guild = await this.guildService.findById(id)

    if (!guild) {
      res.sendStatus(404)
    }

    return guild
  }

  /**
   * Creates a guild.
   *
   * POST /
   * @param {Request} request The request containing a `Guild` object.
   * @returns Promise<Guild>
   * @memberof GuildController
   */
  @httpPost('/')
  public async create(@requestBody() guild: Guild) {
    await this.guildService.create(guild)
    this.socketService.send(GuildEvent.GUILD_CREATE, guild)
  }

  /**
   * Hard deletes a guild.
   *
   * DELETE /:id
   * @param {string} id The ID of the guild.
   * @returns Promise<Guild | undefined>
   * @memberof GuildController
   */
  @httpDelete('/:id')
  public async deleteById(@requestParam('id') id: string) {
    await this.guildService.delete(id)
    this.socketService.send(GuildEvent.GUILD_DELETE, id)
  }

  /**
   * Updates a guild by ID.
   *
   * PUT /:id
   * @param {string} id The ID of the guild.
   * @param {Request} request The request containing a `Guild` object.
   * @returns Promise<Guild>
   * @memberof GuildController
   */
  @httpPut('/:id')
  public async updateById(
    @requestParam('id') id: string,
    @requestBody() guild: Guild
  ) {
    await this.guildService.update(id, guild)
    this.socketService.send(GuildEvent.GUILD_UPDATE, guild)
  }

  /**
   * Gets all suggestions in a Guild
   *
   * GET /:id/suggestions
   * @param {string} id The ID of the guild.
   * @returns Promise<GuildSuggestion[]>
   * @memberof GuildController
   */
  @httpGet('/:id/suggestions')
  public async findSuggestions(@requestParam('id') id: string) {
    return this.guildService.findSuggestions(id)
  }

  /**
   * Gets a Guild suggestion by ID.
   *
   * GET /:id/suggestions/:suggestionId
   * @param {string} id The ID of the guild.
   * @param {number} suggestionId The ID of the suggestion.
   * @returns Promise<GuildSuggestion | undefined>
   * @memberof GuildController
   */
  @httpGet('/:id/suggestions/:suggestionId')
  public async findSuggestionById(
    @requestParam('id') id: string,
    @requestParam('suggestionId') suggestionId: number
  ) {
    return this.guildService.findSuggestionById(id, suggestionId)
  }

  /**
   * Creates a suggestion in a Guild
   *
   * POST /:id/suggestions
   * @param {string} id The ID of the guild.
   * @param {Request} request The request containing a `GuildSuggestion` object.
   * @returns Promise<GuildSuggestion>
   * @memberof GuildController
   */
  @httpPost('/:id/suggestions')
  public async createSuggestion(
    @requestParam('id') id: string,
    @requestBody() suggestion: GuildSuggestion
  ) {
    const ticket = await this.guildService.createSuggestion(id, suggestion)
    this.socketService.send(
      GuildSuggestionEvent.GUILD_SUGGESTION_CREATE,
      suggestion
    )
    return ticket
  }

  /**
   * Updates a Guild suggestion by ID.
   *
   * PUT /:id/suggestions/:suggestionId
   * @param {string} id The ID of the guild.
   * @param {number} suggestionId The ID of the suggestion.
   * @param {Request} request The request containing a `GuildSuggestion` object.
   * @returns Promise<UpdateResult>
   * @memberof GuildController
   */
  @httpPut('/:id/suggestions/:suggestionId')
  public async updateSuggestionById(
    @requestParam('id') id: string,
    @requestParam('suggestionId') suggestionId: number,
    @requestBody() suggestion: GuildSuggestion
  ) {
    await this.guildService.updateSuggestion(id, suggestionId, suggestion)
    this.socketService.send(
      GuildSuggestionEvent.GUILD_SUGGESTION_UPDATE,
      suggestion
    )
  }

  /**
   * Deletes a Guild suggestion by ID.
   *
   * DELETE /:id/suggestions/:suggestionId
   * @param {string} id The ID of the guild.
   * @param {number} suggestionId The ID of the suggestion.
   * @returns Promise<GuildSuggestion | undefined>
   * @memberof GuildController
   */
  @httpDelete('/:id/suggestions/:suggestionId')
  public async deleteSuggestionById(
    @requestParam('id') id: string,
    @requestParam('suggestionId') suggestionId: number
  ) {
    await this.guildService.deleteSuggestion(id, suggestionId)
    this.socketService.send(GuildSuggestionEvent.GUILD_SUGGESTION_DELETE, {
      guildId: id,
      suggestionId
    })
  }

  /**
   * Gets all support tickets in a Guild
   *
   * GET /:id/support-tickets
   * @param {string} id The ID of the guild.
   * @returns Promise<GuildSupportTicket[]>
   * @memberof GuildController
   */
  @httpGet('/:id/support-tickets')
  public async findSupportTickets(@requestParam('id') id: string) {
    return this.guildService.findSupportTickets(id)
  }

  /**
   * Gets a Guild support ticket by ID.
   *
   * GET /:id/support-tickets/:ticketId
   * @param {string} id The ID of the guild.
   * @param {number} ticketId The ID of the support ticket.
   * @returns Promise<GuildSupportTicket | undefined>
   * @memberof GuildController
   */
  @httpGet('/:id/support-tickets/:ticketId')
  public async findSupportTicketById(
    @requestParam('id') id: string,
    @requestParam('ticketId') ticketId: number
  ) {
    return this.guildService.findSupportTicketById(id, ticketId)
  }

  /**
   * Creates a support ticket in a Guild
   *
   * POST /:id/support-tickets
   * @param {string} id The ID of the guild.
   * @param {Request} request The request containing a `GuildSupportTicket` object.
   * @returns Promise<GuildSupportTicket>
   * @memberof GuildController
   */
  @httpPost('/:id/support-tickets')
  public async createSupportTicket(
    @requestParam('id') id: string,
    @requestBody() supportTicket: GuildSupportTicket
  ) {
    const ticket = await this.guildService.createSupportTicket(
      id,
      supportTicket
    )
    this.socketService.send(
      GuildSupportTicketEvent.GUILD_SUPPORT_TICKET_CREATE,
      supportTicket
    )
    return ticket
  }

  /**
   * Updates a Guild support ticket by ID.
   *
   * PUT /:id/support-tickets/:ticketId
   * @param {string} id The ID of the guild.
   * @param {number} ticketId The ID of the support ticket.
   * @param {Request} request The request containing a `GuildSupportTicket` object.
   * @returns Promise<UpdateResult>
   * @memberof GuildController
   */
  @httpPut('/:id/support-tickets/:ticketId')
  public async updateSupportTicketById(
    @requestParam('id') id: string,
    @requestParam('ticketId') ticketId: number,
    @requestBody() supportTicket: GuildSupportTicket
  ) {
    await this.guildService.updateSupportTicket(id, ticketId, supportTicket)
    this.socketService.send(
      GuildSupportTicketEvent.GUILD_SUPPORT_TICKET_UPDATE,
      supportTicket
    )
  }

  /**
   * Deletes a Guild support ticket by ID.
   *
   * DELETE /:id/support-tickets/:ticketId
   * @param {string} id The ID of the guild.
   * @param {number} ticketId The ID of the support ticket.
   * @returns Promise<GuildSupportTicket | undefined>
   * @memberof GuildController
   */
  @httpDelete('/:id/support-tickets/:ticketId')
  public async deleteSupportTicketById(
    @requestParam('id') id: string,
    @requestParam('ticketId') ticketId: number
  ) {
    await this.guildService.deleteSupportTicket(id, ticketId)
    this.socketService.send(
      GuildSupportTicketEvent.GUILD_SUPPORT_TICKET_DELETE,
      {
        guildId: id,
        ticketId
      }
    )
  }

  /**
   * Gets a Guild's settings by ID.
   *
   * GET /:id/settings
   * @param {string} id The ID of the guild.
   * @returns Promise<GuildSettings[]>
   * @memberof GuildController
   */
  @httpGet('/:id/settings')
  public async findSettingsById(@requestParam('id') id: string) {
    return this.guildService.findSettings(id)
  }

  /**
   * Updates a Guild's settings by ID.
   *
   * PUT /:id/settings
   * @param {string} id The ID of the guild.
   * @param {Request} request The request containing a `GuildSettings` object.
   * @returns Promise<UpdateResult>
   * @memberof GuildController
   */
  @httpPut('/:id/settings')
  public async updateSettingsById(
    @requestParam('id') id: string,
    @requestBody() settings: GuildSettings
  ) {
    await this.guildService.updateSettings(id, settings)
    this.socketService.send(GuildSettingsEvent.GUILD_SETTINGS_UPDATE, settings)
  }

  /**
   * Gets all users in a Guild.
   *
   * GET /:id/users
   * @param {string} id The ID of the guild.
   * @returns Promise<GuildUser[]>
   * @memberof GuildController
   */
  @httpGet('/:id/users')
  public async findUsers(@requestParam('id') id: string) {
    return this.guildService.findUsers(id)
  }

  /**
   * Gets a Guild user by ID.
   *
   * GET /:id/users/:userId
   * @param {string} id The ID of the guild.
   * @param {string} userId The ID of the user.
   * @returns Promise<GuildUser | undefined>
   * @memberof GuildController
   */
  @httpGet('/:id/users/:userId')
  public async findUserById(
    @requestParam('id') id: string,
    @requestParam('userId') userId: string
  ) {
    return this.guildService.findUserById(id, userId)
  }

  /**
   * Creates a user in a Guild
   *
   * POST /:id/users
   * @param {string} id The ID of the guild.
   * @param {Request} request The request containing a `GuildUser` object.
   * @returns Promise<GuildUser>
   * @memberof GuildController
   */
  @httpPost('/:id/users')
  public async createUser(
    @requestParam('id') id: string,
    @requestBody() user: GuildUser
  ) {
    await this.guildService.createUser(id, user)
    this.socketService.send(GuildUserEvent.GUILD_USER_CREATE, user)
  }

  /**
   * Updates a Guild user by ID.
   *
   * PUT /:id/users/:userId
   * @param {string} id The ID of the guild.
   * @param {string} userId The ID of the user.
   * @param {Request} request The request containing a `GuildUser` object.
   * @returns Promise<UpdateResult>
   * @memberof GuildController
   */
  @httpPut('/:id/users/:userId')
  public async updateUserById(
    @requestParam('id') id: string,
    @requestParam('userId') userId: string,
    @requestBody() user: GuildUser
  ) {
    await this.guildService.updateUser(id, userId, user)
    this.socketService.send(GuildUserEvent.GUILD_USER_UPDATE, user)
  }

  /**
   * Deletes a Guild user by ID.
   *
   * DELETE /:id/users/:userId
   * @param {string} id The ID of the guild.
   * @param {string} userId The ID of the user.
   * @returns Promise<GuildUser | undefined>
   * @memberof GuildController
   */
  @httpDelete('/:id/users/:userId')
  public async deleteUserById(
    @requestParam('id') id: string,
    @requestParam('userId') userId: string
  ) {
    await this.guildService.deleteUser(id, userId)
    this.socketService.send(GuildUserEvent.GUILD_USER_DELETE, {
      guildId: id,
      userId
    })
  }

  /**
   * Finds a Guild's self assignable roles.
   *
   * GET /:id/self-assignable-roles
   * @param {string} id The ID of the guild.
   * @returns Promise<GuildSelfAssignableRoles>
   * @memberof GuildController
   */
  @httpGet('/:id/self-assignable-roles')
  public async findSelfAssignableRoles(@requestParam('id') id: string) {
    return this.guildService.findSelfAssignableRoles(id)
  }

  /**
   * Finds a Guild's self assignable role by Discord role ID.
   *
   * GET /:id/self-assignable-roles/:roleId
   * @param {string} id The ID of the guild.
   * @param {string} roleId The ID of the Discord role.
   * @returns Promise<GuildSelfAssignableRole | undefined>
   * @memberof GuildController
   */
  @httpGet('/:id/self-assignable-roles/:roleId')
  public async findSelfAssignableRole(
    @requestParam('id') id: string,
    @requestParam('roleId') roleId: string
  ) {
    return this.guildService.findSelfAssignableRole(id, roleId)
  }

  /**
   * Creates a self assignable role.
   *
   * POST /:id/self-assignable-roles
   * @param {string} id The ID of the guild.
   * @param {GuildSelfAssignableRole} selfAssignableRole The self assignable role object.
   * @returns Promise<void>
   * @memberof GuildController
   */
  @httpPost('/:id/self-assignable-roles')
  public async createSelfAssignableRole(
    @requestParam('id') id: string,
    @requestBody() selfAssignableRole: GuildSelfAssignableRole,
    @response() res: Response
  ) {
    const existingAssignableRole = await this.findSelfAssignableRole(
      id,
      selfAssignableRole.roleId
    )

    if (existingAssignableRole) {
      res.sendStatus(409)
      return
    }

    return this.guildService.createSelfAssignableRole(id, selfAssignableRole)
  }

  /**
   * Deletes a Guild self assignable role by Discord role ID.
   *
   * DELETE /:id/self-assignable-roles/:roleId
   * @param {string} id The ID of the guild.
   * @param {string} roleId The ID of the role.
   * @returns Promise<void>
   * @memberof GuildController
   */
  @httpDelete('/:id/self-assignable-roles/:roleId')
  public async deleteSelfAssignableRole(
    @requestParam('id') id: string,
    @requestParam('roleId') roleId: string
  ) {
    await this.guildService.deleteSelfAssignableRole(id, roleId)
  }

  /**
   * Finds a Guild's playlist.
   *
   * GET /:id/playlist
   * @param {string} id The ID of the guild.
   * @returns Promise<Song[]>
   * @memberof GuildController
   */
  @httpGet('/:id/playlist')
  public async findPlaylist(@requestParam('id') id: string) {
    return this.guildService.findPlaylist(id)
  }

  /**
   * Creates a song in a Guild's playlist.
   *
   * POST /:id/playlist
   * @param {string} id The ID of the guild.
   * @returns Promise<Song>
   * @memberof GuildController
   */
  @httpPost('/:id/playlist')
  public async createSong(
    @requestParam('id') id: string,
    @requestBody() song: Song
  ) {
    return this.guildService.createSong(id, song)
  }

  /**
   * Clears a Guild's playlist.
   *
   * DELETE /:id/playlist
   * @param {string} id The ID of the guild.
   * @returns Promise<void>
   * @memberof GuildController
   */
  @httpDelete('/:id/playlist')
  public async clearPlaylist(@requestParam('id') id: string) {
    return this.guildService.clearPlaylist(id)
  }

  /**
   * Finds songs in a Guild's playlist by user ID.
   *
   * GET /:id/playlist/user/:userId
   * @param {string} id The ID of the guild.
   * @param {string} userId The ID of the user.
   * @returns Promise<Song[]>
   * @memberof GuildController
   */
  @httpGet('/:id/playlist/user/:userId')
  public async findSongsByUserId(
    @requestParam('id') id: string,
    @requestParam('userId') userId: string
  ) {
    return this.guildService.findPlaylistSongsByUserId(id, userId)
  }

  /**
   * Deletes songs in a Guild's playlist by user ID.
   *
   * DELETE /:id/playlist/user/:userId
   * @param {string} id The ID of the guild.
   * @param {string} userId The ID of the user.
   * @returns Promise<void>
   * @memberof GuildController
   */
  @httpDelete('/:id/playlist/user/:userId')
  public async deleteSongsByUserId(
    @requestParam('id') id: string,
    @requestParam('userId') userId: string
  ) {
    return this.guildService.deleteSongsByUserId(id, userId)
  }

  /**
   * Deletes a song in a Guild's playlist by song ID.
   *
   * DELETE /:id/playlist/:songId
   * @param {string} id The ID of the guild.
   * @param {string} songId The ID of the song.
   * @returns Promise<void>
   * @memberof GuildController
   */
  @httpDelete('/:id/playlist/:songId')
  public async deleteSongById(
    @requestParam('id') id: string,
    @requestParam('songId') songId: number
  ) {
    return this.guildService.deleteSong(id, songId)
  }
}
