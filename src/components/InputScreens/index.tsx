
import { useAppContext } from '../../index'
import Income from './Income'
import Invest from './Invest'
import Interest from './Interest'
import Others from './Others'
import Guides from './Guides'
import Dispositions from './Dispositions'
import K1s from './K1s'

export default function InputScreens() {
  const { currentScreen } = useAppContext()

  switch (currentScreen) {
    case 'income':
      return <Income />
    case 'invest':
      return <Invest />
    case 'interest':
      return <Interest />
    case 'others':
      return <Others />
    case 'guides':
      return <Guides />
    case 'dispositions':
      return <Dispositions />
    case 'k1s':
      return <K1s />
    default:
      return <div>Unknown screen</div>
  }
}
