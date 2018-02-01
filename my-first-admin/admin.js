var myApp = angular.module('myApp', ['ng-admin']);

myApp.config(['RestangularProvider', function(rgp) {
	rgp.setDefaultHeaders({'X_FK_CLIENT':'SA', 'X_FK_TENANT':'FK', 'X_FK_USER':'chaitra.kr'}),
	rgp.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
	
			delete params._page;
			delete params._perPage;
			delete params._sortField;
			delete params._sortDir;
			if (params._filters) {
          for (var filter in params._filters) {
              params[filter] = params._filters[filter];
           }
           delete params._filters;
        }	
		return {params: params};
	}),
  
  rgp.addElementTransformer('dt_profile', function(element) {
        for (var key in element.values) {
            element[key] = element.dt_list[key];
        }
        return element;
  });
}]);

myApp.config(['NgAdminConfigurationProvider', function (nga) {
    // create an admin application
    var admin = nga.application('Agent Manager\'s Manager')
    			.baseApiUrl('http://localhost:23330/v0/');


    var enums = nga.entity('enums').baseApiUrl('http://localhost:23330/v0/agentAttributes/');

    enums.creationView().title('Create Queue')
      .fields([
        nga.field('value').validation({required: true})])
      .onSubmitSuccess(['progression', 'notification', '$state', 'entity', 'entry', function (progression, notification, $state, entity, entry) {
              // stop the progress bar
              progression.done();
              // add a notification
              notification.log('Queue created', { addnCls: 'humane-flatty-success' });
              // redirect to the show view
              $state.go($state.get('list'), { entity: attributes });
              //$state.go(previousState.name, previousState.params);
              // cancel the default action (redirect to the show view)
              return false;
      }]);
    admin.addEntity(enums);

    var attributes = nga.entity('agentAttributes');
   
    attributes.listView().fields([
        nga.field('id'),
        nga.field('name'),
        nga.field('description'),
        nga.field('value_type')
      ]).title("Agent Attributes");
    admin.addEntity(attributes);


    var attributeMapping = nga.entity('agentAttributes').url(function(entityName, viewType, identifierValue, identifierName) {
          return entityName+'/'+'mappings'+'/'+identifierValue;
    });

    attributes.editionView().actions(['show','list'])
    .fields([
        nga.field('id').editable(false),
        nga.field('name').editable(false),
        nga.field('description').editable(false),
        nga.field('value_type').editable(false),
        nga.field('id', 'reference').label('Profile').editable(false)
          .targetEntity(attributeMapping)
          .targetField(nga.field('profile.name')),
        nga.field('value_enums', 'embedded_list')
          .label('Value')
          .targetFields([nga.field('value').editable(false)
        ]),
        nga.field('').label('')
        .template('<ma-create-button entity-name="enums" size="sm" label="Create queue" default-values="{ agent_attribute: entry.values }"></ma-create-button></span>')  
      ]);

    var channels = nga.entity('channels').baseApiUrl('http://localhost:23330/v0/campaigns/');

    channels.creationView().fields([
       nga.field('channel_id','choice')
          .choices([
              { label: 'VOICE - INBOUND', value: 1},
              { label: 'VOICE - OUTBOUND', value: 2},
              { label: 'VOICE - TWO_WAY', value: 3}
            ])
    ]);
    admin.addEntity(channels);

    var entityAttributeMappings = nga.entity('mappings').baseApiUrl('http://localhost:23330/v0/entityAttributes/');
	
  	var campaigns = nga.entity('campaigns');
  	
	 	campaigns.listView().fields([
	 			nga.field('id'),
	 			nga.field('name'),
	 			nga.field('description'),
	 			nga.field('active')
	 		]).title("Agent Campaigns");
  	
  	campaigns.editionView().fields([
  			nga.field('id'),
  			nga.field('name'),
  			nga.field('description'),
  			nga.field('channels', 'embedded_list').editable(false)
  				.targetFields([
  					nga.field('channel.name'),
  					nga.field('channel.channel_mode')
  				]),
  			nga.field('attributes', 'embedded_list').editable(false)
  				.targetFields([
  					nga.field('entity_attribute.id'),
  					nga.field('entity_attribute.name'),
  					nga.field('entity_attribute.description'),  
  					nga.field('long_value').label('Value')
  				]),
  			nga.field('dispositions', 'embedded_list').editable(false),
        nga.field('').label('')
        .template('<ma-create-button entity-name="channels" size="sm" label="Attach Campaign Channel" default-values="{ campaign_id: entry.values.id }"></ma-create-button></span>')
  		]);

    campaigns.creationView().fields([
       nga.field('id','number'),
       nga.field('name'),
       nga.field('description'),
       nga.field('active','boolean')
          .choices([
              { label:'True', value: 'true'},
              { label: 'False', value: 'false'}
            ])
     ]);

    admin.addEntity(campaigns);

  
  	//add profiles entity
  	var profiles = nga.entity('profiles');
  	profiles.listView().fields([
  			nga.field('id'),
  			nga.field('name'),
  			nga.field('active')
  		]).title("Agent Profiles");
  	admin.addEntity(profiles);

    // var dt_profile = nga.entity('dt').url(function(entityName, viewType, identifierValue, identifierName) {
    //     return entityName+'/'+'profile'+'/'+identifierValue;
    // });

  	var skills = nga.entity('skills');
  	skills.listView().fields([
  			nga.field('id'),
  			nga.field('name'),
  			nga.field('description'),
  			nga.field('skill_category')
  		]).title("Agent Skills");
  	admin.addEntity(skills);

    var team = nga.entity('teams');


    var costCentre = nga.entity('costCentres');

    costCentre.listView().fields([
        nga.field('id'),
        nga.field('code'),
        nga.field('name'),
        nga.field('address'),
        nga.field('city'),
        nga.field('state'),
        nga.field('active'), 
        nga.field('organization.name').label('organization')
      ]).title("Cost Centres");
    admin.addEntity(costCentre);  


    admin.menu(nga.menu()
      .addChild(nga.menu(attributes).icon('<span class="glyphicon glyphicon-equalizer"></span>'))
      .addChild(nga.menu(campaigns).icon('<span class="glyphicon glyphicon-flag"></span>'))
      .addChild(nga.menu(costCentre).icon('<span class="glyphicon glyphicon-home"></span>'))
      .addChild(nga.menu(profiles).icon('<span class="glyphicon glyphicon-user"></span>'))
      .addChild(nga.menu(skills).icon('<span class="glyphicon glyphicon-pencil"></span>'))
    );

    nga.configure(admin);

}]);



