import { jsx as _jsx } from "react/jsx-runtime";
import { useAppContext } from '../../index';
import Income from './Income';
import Invest from './Invest';
import Interest from './Interest';
import Others from './Others';
import Guides from './Guides';
import Dispositions from './Dispositions';
import K1s from './K1s';
export default function InputScreens() {
    const { currentScreen } = useAppContext();
    switch (currentScreen) {
        case 'income':
            return _jsx(Income, {});
        case 'invest':
            return _jsx(Invest, {});
        case 'interest':
            return _jsx(Interest, {});
        case 'others':
            return _jsx(Others, {});
        case 'guides':
            return _jsx(Guides, {});
        case 'dispositions':
            return _jsx(Dispositions, {});
        case 'k1s':
            return _jsx(K1s, {});
        default:
            return _jsx("div", { children: "Unknown screen" });
    }
}
