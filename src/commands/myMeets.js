import { User, MeetPresence } from '../database/models'
import { parse, isValid } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import { timeZone } from '../utils'

module.exports = {
  init (cliente) {
    // function to init
    // run before register
  },
  get config () {
    return {
      name: 'mymeets', // the comand name to call
      type: 'message', // the command event type
      description: 'Mostra as reunioes que você cadastrou',
      usage: 'myMeets <after date>'
    }
  },
  validate (client, message, args) {
    if (args.lenth < 4) { throw new Error('Falta argumentos') }
  },
  async run (client, message, [afterDate]) {
    const userFromDb = await User.findOneAndUpdate({
      discord_id: message.author.id
    }, { name: message.author.username }, { upsert: true })

    const parsedDate = parse(afterDate, 'dd/MM/yyyy HH:mm', new Date())
    const meets = await MeetPresence.find({
      owner: userFromDb._id,
      startTime: { $gt: isValid(parsedDate) ? zonedTimeToUtc(parsedDate, timeZone) : 0 }
    })

    const messageToSend = `
Suas reuniões criadas:
${meets.map(e => `(${e._id}):${' '.repeat(30 - String(e._id).length)}${e.name}`).join('\n')}
    `
    return message.channel.send(messageToSend)
  },
  success (client, message, args) {
    // self descriptive
    // run after run
  },
  fail (err, client, message, args) { // eslint-disable-line handle-callback-err
    // self descriptive
    // run if have an error on validate, run or success
  },
  after (client, message, args) {
    // self descriptive
    // run after all
  }
}
