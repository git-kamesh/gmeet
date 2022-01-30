import React from 'react';

import Button from '../../components/Button';
import { useGoogleAccounts, GoogleAccountSelector } from './components/GoogleAccount';
import './Popup.css';

import Messenger from '../../lib/messenger';
import { i18n } from '../../contents';

import {
  GOOGLE_MEET_CREATE
} from '../../constants';

let ACTIONS = {
  [GOOGLE_MEET_CREATE]: () => Messenger.send({ targetScript: 'background', action: GOOGLE_MEET_CREATE })
};

// Popup component
const Popup = () => {
  const google_acnt_info = useGoogleAccounts();
  const google_disabled_class = google_acnt_info.selectedAccount ? '' : 'ext-disabled';

  return (
    <div className="App">
      <h3 className="ext-font18">👋🏻 <span className='ext-grad-text'>{i18n('welcome.to.gmeet')}</span></h3>

      <div className="ext-mT30">{i18n('welcome.gmeet.desc')}</div>

      <GoogleAccountSelector {...google_acnt_info} />

      <div className={`ext-flex-c ext-mT20 ${google_disabled_class}`}>
        <Button type="secondary" onClick={() => window.close()}>{i18n('cancel')}</Button>
        <Button className="ext-mL20" onClick={ACTIONS[GOOGLE_MEET_CREATE]}>{i18n('new.meeting')}</Button>
      </div>

      <div className={`info ext-mT30 ${google_disabled_class}`}>{i18n('shortcut.info')}</div>
    </div>
  );
};

export default Popup;
