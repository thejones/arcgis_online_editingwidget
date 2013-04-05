
define(['esri/map',
	    'esri/arcgis/utils',
	    "esri/dijit/editing/Editor-all",
	    'esri/layers/FeatureLayer',
	    'dojo/dom',
	    "dojo/_base/array",
	    "dojo/parser","dojo/_base/lang",'dojo/on',"dojo/dom-construct",
		"dijit/layout/BorderContainer",
		"dijit/layout/ContentPane",
		"dojo/domReady!"],function(Map,esriUtils,editor,FeatureLayer,dom,array,parser,lang,on, domConstruct){
		
		return{

		startup: function(){
			 parser.parse();

			//This sample requires a proxy page to handle communications with the ArcGIS Server services. You will need to  
			//replace the url below with the location of a proxy on your machine. See the 'Using the proxy page' help topic 
			//for details on setting up a proxy page.
			esri.config.defaults.io.proxyUrl = "/proxy";

			//This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications
			esri.config.defaults.geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
			
			this.initMap();
		},
		initMap: function(){
			var mapDeferred = esriUtils.createMap("8d86b575fa454fa484ba4147c14b31d7", "map", {
                mapOptions: {
                    /*add options*/
                }
            });
           
            mapDeferred.then(lang.hitch(this, function(response) {
                this.clickHandler = response.clickEventHandle;
                this.clickListener = response.clickEventListener;
                this.map = response.map;   
                this.opLayers = response.itemInfo.itemData.operationalLayers;         
                this.initEditor();
            }));
            on(dom.byId("start"), 'click', lang.hitch(this, 'initEditor'));
            on(dom.byId("stop"), 'click', lang.hitch(this, 'destroyEditor'));
		},

		initEditor: function(){
			
			
			var editLayers = this.editableLayers(this.opLayers);
            console.log("editLayers" + editLayers)
            if(editLayers.length > 0){

                var templateLayers = array.map(editLayers, function (layer) {
                    
                    return layer.featureLayer;
                });

                if(!dom.byId('editorDiv')){
                	var eDiv = domConstruct.create("div",{id:"editorDiv"},'templatePickerPane',"first");
        			
                }

                var editLayerInfo = editLayers;
                
                var templatePicker = new esri.dijit.editing.TemplatePicker({
                    featureLayers: templateLayers,
                    rows: 'auto',
                    columns: 2,
                    grouping: false,
                    showTooltip: true,
                    style: 'height:400px;width:' + '100%;'
                }, 'editorDiv');
                templatePicker.startup();

                var settings = {
                    map: this.map,
                    templatePicker: templatePicker,
                    layerInfos: editLayerInfo,
                    toolbarVisible: false
                };
                var params = {
                    settings: settings
                };
                this.editorWidget = new esri.dijit.editing.Editor(params);
                this.editorWidget.startup();
                this.disablePopups();
				
					

            }
		},
		editableLayers: function(layers){
            var layerInfos = [];
                array.forEach(layers, function (mapLayer, index) {
                    if (mapLayer.layerObject) {
                        if (mapLayer.layerObject.isEditable) {
                            if (mapLayer.layerObject.isEditable()) {
                                layerInfos.push({
                                    'featureLayer': mapLayer.layerObject
                                });
                            }
                        }
                    }
                });
            console.log(layerInfos);
            return layerInfos;
        },
         enablePopups: function() {
            if (this.clickListener) {
                this.clickHandler = this.map.on("click", this.clickListener);
            }
        },

        disablePopups: function() {
            if (this.clickHandler) {
                this.clickHandler.remove();
            }
        },
        destroyEditor: function(){
        	this.editorWidget.destroy();
        	this.editorWidget = null;
        	this.enablePopups();
        }



	}

});

