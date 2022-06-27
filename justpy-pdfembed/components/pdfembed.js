// see https://www.raymondcamden.com/2021/02/17/using-the-pdf-embed-api-with-vuejs

Vue.component('jppdfembed', {
    template:
    `<div  v-bind:id="jp_props.id" :class="jp_props.classes"  :style="jp_props.style"></div>`,
    methods: {
        pdfembed_create() {
            var props = this.$props
            document.addEventListener("adobe_dc_view_sdk.ready", function(){
            dc_view = new AdobeDC.View({
                clientId: props.jp_props.client_id,
                divId: props.jp_props.id.toString()
            });

            dc_view.previewFile(
                {
                    content:{
                        location: {
                            url: "http://127.0.0.1:8000/static/sample.pdf"}
                        },
                    metaData:{
                        fileName: "Sample.pdf"
                    }
                },
                {
                    embedMode: "SIZED_CONTAINER"
                })
            }); // eventListener

            // Register component
            //comp_dict[this.$props.jp_props.id] = dc_view;

            // Bind events
            // console.log('events:',this.$props.jp_props.events);
            // var events = this.$props.jp_props.events;
            // var props = this.$props;
            // events.forEach(function(ename){
            //     // console.log('Binding event:',ename);
            //     cyto.on(ename, function(ev){
            //         var target = ev.target;
            //         // console.log('sending cyto event:', ev.type, target, ev);
            //         const edata = {
            //             'event_type': ename,
            //             'target_id': null,
            //             'id': props.jp_props.id,
            //             'page_id': page_id,
            //             'websocket_id': websocket_id
            //         };
            //         // Add target_id if it exists
            //         try { edata.target_id = target.id() }
            //         catch (err) {}
            //         send_to_server(edata, 'event');
            //     });
            // });

            // this.$props.jp_props.plugins.forEach(function(plugin_config){
            //     //try { edata.target_id = target.id() }
            //     //console.log('plugin_config:',plugin_config);
            //     eval(plugin_config);
            //     //}
            //     // catch (err) {}
            // });
        }
    },
    mounted() {
        var dc_view;
        this.pdfembed_create();
    },
    updated() {
        //this.pdfembed_create();
    },
    props: {
        jp_props: Object
    }
});
