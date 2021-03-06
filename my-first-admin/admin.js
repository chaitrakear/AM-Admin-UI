var myApp = angular.module('myApp', ['ng-admin']);

myApp.constant('key','val');

myApp.constant('ENTITY_VALUES', {
    ENTITY_VALUE: {
        'INTEGER': 'long_value',
        'STRING': 'string_value',
        'BOOLEAN': 'boolean_value',
        'TEXT': 'text_value'
    }
}); 

myApp.provider('vap', ['ENTITY_VALUES', function(VALUE) { 
    this.$get = function() { 
        return { 
            value: ENTITY_VALUES.ENTITY_VALUE[VALUE]
        };
    } 
}]);


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
  rgp.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
        if(operation == 'put') {
          for (var key in element.values) {
            element[key] = element.entity_attribute_mapping[key];
         }
        }
        return { element: element };
  });
}]);

myApp.config(['ENTITY_VALUES', function(ENTITY_VALUES) {
    console.log(ENTITY_VALUES.ENTITY_VALUE['INTEGER']);
}])


myApp.config(['NgAdminConfigurationProvider','ENTITY_VALUES', function (nga, ENTITY_VALUES) {
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

    attributes.editionView()
    .fields([
        nga.field('id').editable(false),
        nga.field('name').editable(false),
        nga.field('description').editable(false),
        nga.field('value_type').editable(false),
        nga.field('id', 'reference').label('Profile').editable(false)
          .targetEntity(attributeMapping)
          .targetField(nga.field('profile.name')),
        nga.field('value_enums', 'embedded_list').editable(false)
          .label('Value')
          .targetFields([ nga.field('value')
        ]),
        nga.field('').label('')
        .template('<ma-create-button entity-name="enums" size="sm" label="Create queue" default-values="{ agent_attribute: entry.values }"></ma-create-button></span>')  
      ]);

    var channels = nga.entity('channels').baseApiUrl('http://localhost:23330/v0/campaigns/');

    channels.creationView().fields([
       nga.field('campaign_id').editable(false),
       nga.field('channel_id','choice')
          .choices([
              { label: 'VOICE - INBOUND', value: 1},
              { label: 'VOICE - OUTBOUND', value: 2},
              { label: 'VOICE - TWO_WAY', value: 3}
            ])
    ]); 
    admin.addEntity(channels);

    var entityAttributeMappings = nga.entity('mappings').baseApiUrl('http://localhost:23330/v0/entityAttributes/');
    var eValue = nga.entity('values').baseApiUrl('http://localhost:23330/v0/entityAttributes/');
    var entityAttribute = nga.entity('entityAttributes');
    var attributeValue = nga.entity('entityAttributeValue');
     // var attributeValue = nga.entity('entityAttributeValue').url(function(entityName, viewType, identifierValue, identifierName) {
     //       return entityName+'/'+identifierValue;
     // });
    
    entityAttribute.listView().fields([
        nga.field('name'),
        nga.field('description')
      ]);

    eValue.editionView().title('Edit Attribute').fields([
          nga.field('entity_attribute.id'),
          nga.field('entity_attribute.name'),
          nga.field('entity_attribute.description'),
          nga.field('value_type')
      ]);


    eValue.creationView().title('Add Attribute').fields([
        nga.field('entity_attribute_id').editable(false),
        nga.field('entity_attribute_mapping_id').editable(false),
        nga.field('entity_attribute_id', 'reference').label('Attribute Name')
            .targetEntity(entityAttribute)
            .targetField(nga.field('name')),
        nga.field('value_type','choice').label('Value Type')
            .choices([
                {label: 'INTEGER', value: 'INTEGER'},
                {label: 'STRING', value: 'STRING'},
                {label: 'BOOLEAN', value: 'BOOLEAN'},
                {label: 'TEXT', value: 'TEXT'}
              ]),   
        //nga.field(ENTITY_VALUES.ENTITY_VALUE[entry.value_type]).label('Value')  
        nga.field('value').label('Value')
            .transform(function matchValue(value, entry) {
                if (entry.value_type == "INTEGER") {
                  entry.long_value = null;
                  entry.long_value = value;
                } 
                if (entry.value_type == "BOOLEAN") {
                  entry.boolean_value = value;
                  entry.long_value = null;
                }
                if (entry.value_type == "STRING") {
                  entry.string_value = value;
                  entry.long_value = null;
                }
                if (entry.value_type == "TEXT") {
                  entry.text_value = value;
                  entry.long_value = null;
                }
            })  
       ]);
    admin.addEntity(eValue);


    entityAttributeMappings.creationView().title('Add Attribute').fields([
        nga.field('entity_attribute_id', 'reference').label('Attribute Name')
            .targetEntity(entityAttribute)
            .targetField(nga.field('name')),
        nga.field('value_type','choice').label('Value Type')
            .choices([
                {label: 'INTEGER', value: 'INTEGER'},
                {label: 'STRING', value: 'STRING'},
                {label: 'BOOLEAN', value: 'BOOLEAN'},
                {label: 'TEXT', value: 'TEXT'}
              ]),
        nga.field('long_value').label('Value')
            .transform(function matchValue(value, entry) {
                if (entry.value_type == "INTEGER") {
                  entry.long_value = null;
                  entry.long_value = value;
                } 
                if (entry.value_type == "BOOLEAN") {
                  entry.boolean_value = value;
                  entry.long_value = null;
                }
                if (entry.value_type == "STRING") {
                  entry.string_value = value;
                  entry.long_value = null;
                }
                if (entry.value_type == "TEXT") {
                  entry.text_value = value;
                  entry.long_value = null;
                }
            })
      ]);
    admin.addEntity(entityAttributeMappings);


    attributeValue.editionView().fields([
          nga.field('id').editable(false),
          nga.field('value_type').editable(false),
          nga.field('value').label('Value')
            .transform(function matchValue(value, entry) {
                if (entry.value_type == "INTEGER") {
                  entry.long_value = value;
                } 
                if (entry.value_type == "BOOLEAN") {
                  entry.boolean_value = value;
                  entry.long_value = null;
                }
                if (entry.value_type == "STRING") {
                  entry.string_value = value;
                  entry.long_value = null;
                }
                if (entry.value_type == "TEXT") {
                  entry.text_value = value;
                  entry.long_value = null;
                }
            })
      ])
    .actions([]);
    admin.addEntity(attributeValue);
	
  	var campaigns = nga.entity('campaigns');
  	
	 	campaigns.listView().fields([
	 			nga.field('id'),
	 			nga.field('name'),
	 			nga.field('description'),
	 			nga.field('active')
	 		]).title("Agent Campaigns");
  	
    campaigns.showView().fields([
        nga.field('id'),
        nga.field('name'),
        nga.field('description'),
        nga.field('channels', 'embedded_list')
          .targetFields([
            nga.field('channel.name'),
            nga.field('channel.channel_mode')
          ]),
        nga.field('attributes', 'embedded_list')
          .targetEntity(attributeValue)
          .targetFields([
            nga.field('entity_attribute.id'),
            nga.field('entity_attribute.name'),
            nga.field('entity_attribute.description'),
            nga.field('long_value') 
            .template('<ma-field ng-if="entry.values.value_type == \"INTEGER\"" field="::field"" entry="entry" entity="::entity" form="formController.form" datastore="::formController.dataStore"></ma-field>', true),
            nga.field('string_value')
            .template('<ma-field ng-if="entry.values.value_type == \"STRING\"" field="::field" value="entry.values[field.name()]" entry="entry" entity="::entity" form="formController.form" datastore="::formController.dataStore"></ma-field>', true),
            nga.field('boolean_value')
            .template('<ma-field ng-if="entry.values.value_type == \"BOOLEAN\"" field="::field" value="entry.value()" entry="entry" entity="::entity" form="formController.form" datastore="::formController.dataStore"></ma-field>', true),
            nga.field('text_value')
            .template('<ma-field ng-if="entry.values.value_type == \"TEXT\"" field="::field" value="entry.values.id" entry="entry" entity="::entity" form="formController.form" datastore="::formController.dataStore"></ma-field>', true)
          ])
        .listActions(['<ma-edit-button entity="::entity" entry="::entry" size="xs" default-values="{ id: entry.values.id, value_type: entry.values.value_type }" label="Edit"></ma-edit-button></span>']),
        nga.field('').label('')
        .template('<ma-create-button entity-name="channels" size="sm" label="Attach Campaign Channel" default-values="{ campaign_id: entry.values.id  }"></ma-create-button></span>'),
        nga.field('').label('')
        .template('<ma-create-button entity-name="values" size="sm" label="Attach Campaign Attribute" default-values="{ campaign_id: entry.values.id , mapping_id: entry.values.entity_attribute_mapping_id}"></ma-create-button></span>')
  ]).actions(['']);

    campaigns.creationView().fields([
       nga.field('name'),
       nga.field('description'),
       nga.field('active','boolean')
          .choices([
              { label:'True', value: 'true'},
              { label: 'False', value: 'false'}
            ])
     ]);

    admin.addEntity(campaigns);

  
    var dt_profile = nga.entity('dt').url(function(entityName, viewType, identifierValue, identifierName) {
        return entityName+'/'+'profile'+'/'+  identifierValue;
    });
    admin.addEntity(dt_profile);  

  	//add profiles entity
  	var profiles = nga.entity('profiles');
    profiles.listView().fields([
  			nga.field('id'),
  			nga.field('name'),
  			nga.field('active')
  		])
    .title("Agent Profiles")
    .listActions(['<ma-show-button entry="entry" label=Show related DTs entity-name="dt" size="sm">']);
    admin.addEntity(profiles);


    dt_profile.showView().fields([
        nga.field('profile_id','reference').label('Profile')
        .targetEntity(profiles)
        .targetField(nga.field('name')),
        nga.field('dt_list','embedded_list').label('Decision ? Trees')  
        .targetFields([
            nga.field('name'),
            nga.field('category')
          ])
        .listActions(['<ma-delete-button entry="::entry" entity-name="" default-values="{ id: Constants.DT_ROLES[entry.values.id] } size="sm" label="Remove"></ma-delete-button>'])
      ]).actions(['']);
    
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



