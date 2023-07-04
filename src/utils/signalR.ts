import { HubConnectionBuilder, HubConnection, HttpTransportType } from '@microsoft/signalr'
import { MPC_HUB, CPM_HUB } from '@/api/modules'
import { SignalrCls, SingleTaskType } from '@/types/signalR'
import useMpcStore from '@/store/modules/mpc'
const mpcStore = useMpcStore()
class SignalR implements SignalrCls {
  private connection: HubConnection
  constructor(type: string = MPC_HUB) {
    const url = mpcStore.onlineUrl + (type === CPM_HUB ? CPM_HUB : MPC_HUB)
    this.connection = new HubConnectionBuilder()
      .withUrl(url, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .build()
  }
  async start() {
    try {
      await this.connection.start()
      console.log('SignalR connected')
    } catch (err) {
      console.error(err)
    }
  }

  async stop() {
    try {
      await this.connection.stop()
      console.log('SignalR disconnected')
    } catch (err) {
      console.error(err)
    }
  }

  async sendMessage(message: SingleTaskType) {
    try {
      await this.connection.invoke('SendMessage', message)
    } catch (err) {
      console.error(err)
    }
  }

  onMessageReceived(message: SingleTaskType, callback: (res: any, res2?: string) => void) {
    this.connection.on(message, callback)
  }
}

export default SignalR
