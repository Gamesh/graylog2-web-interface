const Routes = {
  HOME: '/',
  SEARCH: '/search',
  STREAMS: '/streams',
  SOURCES: '/sources',
  DASHBOARDS: '/dashboards',
  SYSTEM: {
    COLLECTORS: '/system/collectors',
    CONTENTPACKS: {
      LIST: '/system/contentpacks',
      EXPORT: '/system/contentpacks/export',
    },
    GROKPATTERNS: '/system/grokpatterns',
    INPUTS: '/system/inputs',
    NODES: '/system/nodes',
    OUTPUTS: '/system/outputs',
    OVERVIEW: '/system/overview',
    ROLES: '/system/roles',
    USERS: {
      CREATE: '/system/users/new',
      edit: (username) => '/system/users/edit/' + username,
      LIST: '/system/users',
    },
  },
  message_show: (index, messageId) => `/messages/${index}/${messageId}`,
  stream_edit: (streamId) => '/streams/' + streamId + '/edit',
  stream_outputs: (streamId) => '/streams/' + streamId + '/outputs',
  stream_alerts: (streamId) => '/streams/' + streamId + '/alerts',
  stream_search: (streamId, query, type, range) => '/streams/' + streamId + '/search' + '?query=' + query + '&type=' + range + '&range=' + range,
  startpage_set: (type, id) => '/startpage/set/' + type + '/' + id,

  dashboard_show: (dashboardId) => '/dashboards/' + dashboardId,

  node: (nodeId) => `/system/nodes/${nodeId}`,

  global_input_extractors: (inputId) => `/system/inputs/${inputId}/extractors`,
  local_input_extractors: (nodeId, inputId) => `/system/inputs/${nodeId}/${inputId}/extractors`,
  export_extractors: (nodeId, inputId) => `${Routes.local_input_extractors(nodeId, inputId)}/export`,
  import_extractors: (nodeId, inputId) => `${Routes.local_input_extractors(nodeId, inputId)}/import`,

  edit_input_extractor: (nodeId, inputId, extractorId) => `/system/inputs/${nodeId}/${inputId}/extractors/${extractorId}/edit`,
};

export default Routes;
