// see https://www.raymondcamden.com/2021/02/17/using-the-pdf-embed-api-with-vuejs
// https://gist.github.com/AlexandruMiricioiu/0ac17faf92e5dd72eabdae21bdbbe4a2

Vue.component('jppdfembed', {
    template:
    `<div  v-bind:id="jp_props.id" :class="jp_props.classes"  :style="jp_props.style"></div>`,
    data: function () {
        return {
            adobeApiReady: false,
            previewFilePromise: null,
            adobeDCView: null
        }
    },
    methods: {
        registerView() {
            this.adobeDCView = new AdobeDC.View({
                clientId: "31f06deb7bdf42ddb058dfc36613230b",
                divId: this.$props.jp_props.id.toString()
            });
        },
        renderPdf(url, fileName) {
            if (!this.adobeApiReady) {
                console.log('API not ready yet');
                return
            };
            const previewConfig = {
                defaultViewMode: 'FIT_WIDTH',
                showAnnotationTools: false,
                // embedMode: "SIZED_CONTAINER"
            }
            // adobeDCView = new AdobeDC.View({
            //     clientId: "31f06deb7bdf42ddb058dfc36613230b",
            //     divId: "1"
            // })

            // Register component
            // comp_dict[this.$props.jp_props.id] = adobeDCView;
            //comp_dict[1] = adobeDCView;

            this.previewFilePromise = this.adobeDCView.previewFile({
                content: {
                    location: {url: url}
                },
                metaData: {fileName: fileName, id: fileName},
                }, previewConfig);
        },
        // pdfembed_create() {
            // if(window.AdobeDC) this.pdfAPIReady = true;
            // var props = this.$props;

            // document.addEventListener("adobe_dc_view_sdk.ready", function(){
            // dc_view = new AdobeDC.View({
            //     clientId: props.jp_props.client_id,
            //     divId: props.jp_props.id.toString()
            // });

            // dc_view.previewFile(
            //     {
            //         content:{
            //             location: {
            //                 url: "http://127.0.0.1:8000/static/sample.pdf"}
            //             },
            //         metaData:{
            //             fileName: "Sample.pdf"
            //         }
            //     },
            //     {
            //         embedMode: "SIZED_CONTAINER"
            //     })
            // }); // eventListener

            // Register component
            //comp_dict[this.$props.jp_props.id] = dc_view;
        //     comp_dict[this.$props.jp_props.id] = this;

        // }
    },
    mounted() {
        comp_dict[this.$props.jp_props.id] = this;

        if (window.AdobeDC) {
            console.log('AdobeDC ready', this);
            this.adobeApiReady = true;
            this.registerView();
        } else {
            console.log('AdobeDC not ready', this);
            document.addEventListener('adobe_dc_view_sdk.ready', () => {
                this.adobeApiReady = true;
                this.registerView();
            })
        };
    },
    updated() {
    },
    props: {
        jp_props: Object
    }
});
