import {
  Menu,
  app,
  MenuItemConstructorOptions,
} from 'electron';
import i18next from 'i18next';
import { createSelector, createStructuredSelector } from 'reselect';

import { dispatch, select, Service } from '../../store';
import { RootState } from '../../store/rootReducer';
import {
  MENU_BAR_ADD_NEW_SERVER_CLICKED,
  MENU_BAR_SELECT_SERVER_CLICKED,
  MENU_BAR_TOGGLE_IS_SHOW_WINDOW_ON_UNREAD_CHANGED_ENABLED_CLICKED,
  MENU_BAR_TOGGLE_IS_TRAY_ICON_ENABLED_CLICKED,
  SIDE_BAR_DOWNLOADS_BUTTON_CLICKED,
} from '../actions';
import { getRootWindow } from './rootWindow';
import { getWebContentsByServerUrl } from './serverView';

const t = i18next.t.bind(i18next);

const on = (
  condition: boolean,
  getMenuItems: () => MenuItemConstructorOptions[]
): MenuItemConstructorOptions[] => (condition ? getMenuItems() : []);

const selectAddServersDeps = createStructuredSelector<
  RootState,
  Pick<RootState, 'isAddNewServersEnabled'>
>({
  isAddNewServersEnabled: ({ isAddNewServersEnabled }) =>
    isAddNewServersEnabled,
});

const createAppMenu = createSelector(
  selectAddServersDeps,
  ({ }): MenuItemConstructorOptions => ({
    id: 'appMenu',
    label: process.platform === 'darwin' ? app.name : t('menus.fileMenu'),
    submenu: [     
      {
        id: 'quit',
        label: t('menus.quit', { appName: app.name }),
        accelerator: 'CommandOrControl+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  })
);

const selectViewDeps = createStructuredSelector<
  RootState,
  Pick<
    RootState,
    | 'currentView'
    | 'isSideBarEnabled'
    | 'isTrayIconEnabled'
    | 'isMenuBarEnabled'
    | 'rootWindowState'
  >
>({
  currentView: ({ currentView }) => currentView,
  isSideBarEnabled: ({ isSideBarEnabled }) => isSideBarEnabled,
  isTrayIconEnabled: ({ isTrayIconEnabled }) => isTrayIconEnabled,
  isMenuBarEnabled: ({ isMenuBarEnabled }) => isMenuBarEnabled,
  rootWindowState: ({ rootWindowState }) => rootWindowState,
});

const createViewMenu = createSelector(
  selectViewDeps,
  ({
    currentView,
    isTrayIconEnabled,
    rootWindowState,
  }): MenuItemConstructorOptions => ({
    id: 'viewMenu',
    label: t('menus.viewMenu'),
    submenu: [
      {
        id: 'reload',
        label: t('menus.reload'),
        accelerator: 'CommandOrControl+R',
        enabled: typeof currentView === 'object' && !!currentView.url,
        click: async () => {
          const browserWindow = await getRootWindow();

          if (!browserWindow.isVisible()) {
            browserWindow.showInactive();
          }
          browserWindow.focus();
          const guestWebContents =
            typeof currentView === 'object'
              ? getWebContentsByServerUrl(currentView.url)
              : null;
          guestWebContents?.reload();
        },
      },
      {
        id: 'reloadIgnoringCache',
        label: t('menus.reloadIgnoringCache'),
        enabled: typeof currentView === 'object' && !!currentView.url,
        click: async () => {
          const browserWindow = await getRootWindow();

          if (!browserWindow.isVisible()) {
            browserWindow.showInactive();
          }
          browserWindow.focus();
          const guestWebContents =
            typeof currentView === 'object'
              ? getWebContentsByServerUrl(currentView.url)
              : null;
          guestWebContents?.reloadIgnoringCache();
        },
      },
      {
        id: 'back',
        label: t('menus.back'),
        enabled: typeof currentView === 'object' && !!currentView.url,
        accelerator: process.platform === 'darwin' ? 'Command+[' : 'Alt+Left',
        click: async () => {
          const browserWindow = await getRootWindow();

          if (!browserWindow.isVisible()) {
            browserWindow.showInactive();
          }
          browserWindow.focus();
          const guestWebContents =
            typeof currentView === 'object'
              ? getWebContentsByServerUrl(currentView.url)
              : null;
          guestWebContents?.goBack();
        },
      },
      {
        id: 'forward',
        label: t('menus.forward'),
        enabled: typeof currentView === 'object' && !!currentView.url,
        accelerator: process.platform === 'darwin' ? 'Command+]' : 'Alt+Right',
        click: async () => {
          const browserWindow = await getRootWindow();

          if (!browserWindow.isVisible()) {
            browserWindow.showInactive();
          }
          browserWindow.focus();
          const guestWebContents =
            typeof currentView === 'object'
              ? getWebContentsByServerUrl(currentView.url)
              : null;
          guestWebContents?.goForward();
        },
      },
      { type: 'separator' },
      {
        id: 'showTrayIcon',
        label: t('menus.showTrayIcon'),
        type: 'checkbox',
        checked: isTrayIconEnabled,
        accelerator:
          process.platform === 'darwin' ? 'Shift+Command+T' : 'Ctrl+Shift+T',
        click: ({ checked }) => {
          setTimeout(() => {
            dispatch({
              type: MENU_BAR_TOGGLE_IS_TRAY_ICON_ENABLED_CLICKED,
              payload: checked,
            });
          }, 10);
        },
      },
      ...on(process.platform === 'darwin', () => [
        {
          id: 'showFullScreen',
          label: t('menus.showFullScreen'),
          type: 'checkbox',
          checked: rootWindowState.fullscreen,
          accelerator: 'Control+Command+F',
          click: async ({ checked: enabled }) => {
            const browserWindow = await getRootWindow();

            if (!browserWindow.isVisible()) {
              browserWindow.showInactive();
            }
            browserWindow.focus();
            browserWindow.setFullScreen(enabled);
          },
        },
      ]),      
      { type: 'separator' },
      {
        id: 'resetZoom',
        label: t('menus.resetZoom'),
        accelerator: 'CommandOrControl+0',
        click: async () => {
          const browserWindow = await getRootWindow();

          if (!browserWindow.isVisible()) {
            browserWindow.showInactive();
          }
          browserWindow.focus();
          const url = typeof currentView === 'object' ? currentView.url : null;
          if (!url) {
            return;
          }
          const guestWebContents = getWebContentsByServerUrl(url);
          guestWebContents?.setZoomLevel(0);
        },
      },
      {
        id: 'zoomIn',
        label: t('menus.zoomIn'),
        accelerator: 'CommandOrControl+Plus',
        click: async () => {
          const browserWindow = await getRootWindow();
          if (!browserWindow.isVisible()) {
            browserWindow.showInactive();
          }
          browserWindow.focus();
          const url = typeof currentView === 'object' ? currentView.url : null;
          if (!url) {
            return;
          }
          const guestWebContents = getWebContentsByServerUrl(url);
          if (!guestWebContents) {
            return;
          }
          const zoomLevel = guestWebContents?.getZoomLevel();
          if (zoomLevel >= 9) {
            return;
          }

          guestWebContents.setZoomLevel(zoomLevel + 1);
        },
      },
      {
        id: 'zoomOut',
        label: t('menus.zoomOut'),
        accelerator: 'CommandOrControl+-',
        click: async () => {
          const browserWindow = await getRootWindow();
          if (!browserWindow.isVisible()) {
            browserWindow.showInactive();
          }
          browserWindow.focus();
          const url = typeof currentView === 'object' ? currentView.url : null;
          if (!url) {
            return;
          }

          const guestWebContents = getWebContentsByServerUrl(url);
          if (!guestWebContents) {
            return;
          }

          const zoomLevel = guestWebContents.getZoomLevel();
          if (zoomLevel <= -9) {
            return;
          }

          guestWebContents.setZoomLevel(zoomLevel - 1);
        },
      },
    ],
  })
);

const selectWindowDeps = createStructuredSelector<
  RootState,
  Pick<
    RootState,
    | 'servers'
    | 'currentView'
    | 'isShowWindowOnUnreadChangedEnabled'
    | 'isAddNewServersEnabled'
  >
>({
  servers: ({ servers }) => servers,
  currentView: ({ currentView }) => currentView,
  isShowWindowOnUnreadChangedEnabled: ({
    isShowWindowOnUnreadChangedEnabled,
  }) => isShowWindowOnUnreadChangedEnabled,
  isAddNewServersEnabled: ({ isAddNewServersEnabled }) =>
    isAddNewServersEnabled,
});

const createWindowMenu = createSelector(
  selectWindowDeps,
  ({
    servers,
    currentView,
    isShowWindowOnUnreadChangedEnabled,
    isAddNewServersEnabled,
  }): MenuItemConstructorOptions => ({
    id: 'windowMenu',
    label: t('menus.windowMenu'),
    role: 'windowMenu',
    submenu: [
      ...on(process.platform === 'darwin' && isAddNewServersEnabled, () => [
        {
          id: 'addNewServer',
          label: t('menus.addNewServer'),
          accelerator: 'CommandOrControl+N',
          click: async () => {
            const browserWindow = await getRootWindow();

            if (!browserWindow.isVisible()) {
              browserWindow.showInactive();
            }
            browserWindow.focus();
            dispatch({ type: MENU_BAR_ADD_NEW_SERVER_CLICKED });
          },
        },
        { type: 'separator' },
      ]),
      ...on(servers.length > 0, () => [
        ...servers.map(
          (server, i): MenuItemConstructorOptions => ({
            id: server.url,
            type:
              typeof currentView === 'object' && currentView.url === server.url
                ? 'checkbox'
                : 'normal',
            label: server.title?.replace(/&/g, '&&'),
            checked:
              typeof currentView === 'object' && currentView.url === server.url,
            accelerator: `CommandOrControl+${i + 1}`,
            click: async () => {
              const browserWindow = await getRootWindow();

              if (!browserWindow.isVisible()) {
                browserWindow.showInactive();
              }
              browserWindow.focus();
              dispatch({
                type: MENU_BAR_SELECT_SERVER_CLICKED,
                payload: server.url,
              });
            },
          })
        ),
        { type: 'separator' },
      ]),
      {
        id: 'downloads',
        label: t('menus.downloads'),
        checked: currentView === 'downloads',
        accelerator: 'CommandOrControl+D',
        click: async () => {
          const browserWindow = await getRootWindow();

          if (!browserWindow.isVisible()) {
            browserWindow.showInactive();
          }
          browserWindow.focus();
          dispatch({ type: SIDE_BAR_DOWNLOADS_BUTTON_CLICKED });
        },
      },
      {
        id: 'showOnUnreadMessage',
        type: 'checkbox',
        label: t('menus.showOnUnreadMessage'),
        checked: isShowWindowOnUnreadChangedEnabled,
        click: async ({ checked }) => {
          const browserWindow = await getRootWindow();

          if (!browserWindow.isVisible()) {
            browserWindow.showInactive();
          }
          browserWindow.focus();
          dispatch({
            type: MENU_BAR_TOGGLE_IS_SHOW_WINDOW_ON_UNREAD_CHANGED_ENABLED_CLICKED,
            payload: checked,
          });
        },
      },
      { type: 'separator' },
      {
        id: 'minimize',
        role: 'minimize',
        label: t('menus.minimize'),
        accelerator: 'CommandOrControl+M',
      },
      {
        id: 'close',
        role: 'close',
        label: t('menus.close'),
        accelerator: 'CommandOrControl+W',
      },
    ],
  })
);



const selectMenuBarTemplate = createSelector(
  [
    createAppMenu,
    createViewMenu,
    createWindowMenu,
  ],
  (...menus) => menus
);

const selectMenuBarTemplateAsJson = createSelector(
  selectMenuBarTemplate,
  (template: unknown) => JSON.stringify(template)
);

class MenuBarService extends Service {
  protected initialize(): void {
    this.watch(selectMenuBarTemplateAsJson, async () => {
      const menuBarTemplate = select(selectMenuBarTemplate);
      const menu = Menu.buildFromTemplate(menuBarTemplate);

      if (process.platform === 'darwin') {
        Menu.setApplicationMenu(menu);
        return;
      }

      Menu.setApplicationMenu(null);
      (await getRootWindow()).setMenu(menu);
    });
  }
}

export default new MenuBarService();
