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
        // registerView() {
        //     this.adobeDCView = new AdobeDC.View({
        //         clientId: "31f06deb7bdf42ddb058dfc36613230b",
        //         divId: this.$props.jp_props.id.toString()
        //     });
        // },
        renderPdf(url, fileName) {
            if (!this.adobeApiReady) {
                console.log('API not ready yet');
                return
            };

            this.adobeDCView = new AdobeDC.View({
                clientId: this.$props.jp_props.client_id,
                divId: this.$props.jp_props.id.toString()
            });

            const previewConfig = {
                defaultViewMode: 'FIT_WIDTH',
                showAnnotationTools: false,
                // embedMode: "SIZED_CONTAINER"
            }

            // Register component
            comp_dict[this.$props.jp_props.id] = this;

            this.previewFilePromise = this.adobeDCView.previewFile({
                content: {
                    location: {url: url}
                },
                metaData: {fileName: fileName, id: fileName},
                }, previewConfig);
        },
    },
    mounted() {
        comp_dict[this.$props.jp_props.id] = this;

        if (window.AdobeDC) {
            console.log('AdobeDC ready', this);
            this.adobeApiReady = true;
            // this.registerView();
        } else {
            console.log('AdobeDC not ready', this);
            document.addEventListener('adobe_dc_view_sdk.ready', () => {
                this.adobeApiReady = true;
                // this.registerView();
            })
        };
    },
    updated() {
    },
    props: {
        jp_props: Object
    }
});
