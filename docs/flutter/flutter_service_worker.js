'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "acd1b84835684161d5d02c15aa807f5b",
"version.json": "3347ca66bc99e9e72bc31f044db5f1fa",
"index.html": "16ac27550911ba536f97e9d9121375ed",
"/": "16ac27550911ba536f97e9d9121375ed",
"main.dart.js": "447f23e06bb4a69efe3fc57dcb057e9f",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c",
"fallback-fonts/notosanskharoshthi/v16/Fh4qPiLjKS30-P4-pGMMXCCfvkc5Vd7KE5z9rFyx5mR1.woff2": "b3dac678b34d6be4c8c32cad0a0c2c89",
"fallback-fonts/notosanshatran/v16/A2BBn4Ne0RgnVF3Lnko-0sOBIfL_mMo3r1nwzDs.woff2": "5d12b38a81de1eb80861360fd66f6d73",
"fallback-fonts/notosanscuneiform/v17/bMrrmTWK7YY-MF22aHGGd7H8PhJtvBDWsbZDlCQu.woff2": "61e936bc07f4d725f40a742f52275c4b",
"fallback-fonts/notosanscuneiform/v17/bMrrmTWK7YY-MF22aHGGd7H8PhJtvBDWse5DlCQu.woff2": "a88d492c5759bdb847af54b5b743b587",
"fallback-fonts/notosanscuneiform/v17/bMrrmTWK7YY-MF22aHGGd7H8PhJtvBDWsbhDlA.woff2": "ba408e4f844bef28a663a7f76b148a7e",
"fallback-fonts/notosanstaiviet/v19/8QIUdj3HhN_lv4jf9vsE-9GMOLsaSPZr7o4fWsRO9w.woff2": "a88ee6111c6874ac2d50d97a248986fd",
"fallback-fonts/notosanstamilsupplement/v21/DdTz78kEtnooLS5rXF1DaruiCd_bFp_Ph4sGcn7ax_vpAeMkeq1x.woff2": "e00caa4fb098fecf4a329420845803ab",
"fallback-fonts/notosansoriya/v31/AYCppXfzfccDCstK_hrjDyADv5e9748vhj3CJBLHIARtgD6TJQS0dJT5Ivj0f6_Z6LhHBRe-.woff2": "851fa8081db809393efe4ae39c58d003",
"fallback-fonts/notosansphagspa/v15/pxiZyoo6v8ZYyWh5WuPeJzMkd4SrGChkr0SsrvNXiA.woff2": "26a5d5772f98c14d2410ca4afe5c55c6",
"fallback-fonts/notosanstc/v36/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76CyzCNEt1a3.woff2": "0c26b3ca611ad4a9bf6fa5fb449d9fac",
"fallback-fonts/notosanstc/v36/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76CyzClEt1a3.woff2": "0ae5fc85d841a492ac0b756f3b2d3627",
"fallback-fonts/notosanstc/v36/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76CyzCJEt1a3.woff2": "46ca0c22cd64ab4ee25c227a7b72dd8e",
"fallback-fonts/notosanstc/v36/-nFuOG829Oofr2wohFbTp9ifNAn722rq0MXz76CyzC1Etw.woff2": "b00bc72d0283a70f877fd66de54563b4",
"fallback-fonts/notosanssyriac/v16/Ktk7AKuMeZjqPnXgyqribqzQqgW0LYiVqV7dXcP0C-VD9MaMyZfUL_FC.woff2": "79da462d224e1590828f5238dc0dcd23",
"fallback-fonts/notosansthai/v25/iJWnBXeUZi_OHPqn4wq6hQ2_hbJ1xyN9wd43SofNWcd1MKVQt_So_9CdU5RtpzR-QRvzzXg.woff2": "faed8ce6c67e1881ee32f8e11e8e10e7",
"fallback-fonts/notosanscanadianaboriginal/v26/4C_TLjTuEqPj-8J01CwaGkiZ9os0iGVkezM1mUT-j_Lmlzda6uH_nnX1bzigWLn_zQsg0q0uhQ.woff2": "134d0f853bda3878e4e9ebc87270a909",
"fallback-fonts/notosansbhaiksuki/v17/UcC63EosKniBH4iELXATsSBWdvUHXxhj8rfUdU4wh9U.woff2": "42a8cc6fc94d8297c6c47d6f8313cff5",
"fallback-fonts/notosansosmanya/v18/8vIS7xs32H97qzQKnzfeWzUyUpOJmz6hR47NCV5Z.woff2": "2d81b48f789986adc752415cebc433d5",
"fallback-fonts/notosanscypriot/v19/8AtzGta9PYqQDjyp79a6f8Cj-3a3cxIpK5MPpahF.woff2": "fe4afead1fe70f8a665ee481c492a22a",
"fallback-fonts/notosansgurmukhi/v26/w8g9H3EvQP81sInb43inmyN9zZ7hb7ATbSWo4q8dJ74a3cVrYFQ_bogT0-gPeG1Oenb0Z_trdp7h.woff2": "6ac76e5156d4d2f8c4980c35057ad497",
"fallback-fonts/notosansmath/v15/7Aump_cpkSecTWaHRlH2hyV5UHkD-V048PW0.woff2": "8636d33dd4535c043d67c06b3ae1763b",
"fallback-fonts/notosansrunic/v17/H4c_BXWPl9DZ0Xe_nHUaus7W68WWbhpvHtgIYg.woff2": "5ab285d60dfe3ba1780420b8e97e8dd0",
"fallback-fonts/notosansjavanese/v23/2V01KJkDAIA6Hp4zoSScDjV0Y-eoHAHT-Z3MngEefiidxJnkFFxiZYWj4O8.woff2": "90e00ebae0b0bb7ab437dd426f1cd29d",
"fallback-fonts/notosanslinearb/v17/HhyJU4wt9vSgfHoORYOiXOckKNB737IV2RkFTq4EPw.woff2": "2c067b7a947b7749b0ec12debdea3598",
"fallback-fonts/notosansbengali/v26/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6KmsolLudWk8izI0lc.woff2": "649d5d39bd7433a6df289eadbc37164b",
"fallback-fonts/notosanslao/v30/bx6lNx2Ol_ixgdYWLm9BwxM3NW6BOkuf763Clj73CiQ_J1Djx9pidOt4ccbdepMK3riB2w.woff2": "7c8fbd5b8283e1756b5aa0cfe8bf44f2",
"fallback-fonts/notosansanatolianhieroglyphs/v16/ijw9s4roRME5LLRxjsRb8A0gKPSWq4BbDmHHu6j2pEtUJzZWXyPIymc5QYo.woff2": "bb3c30176ebeac7bdf8bc2d1fdd18542",
"fallback-fonts/notosansmro/v18/qWcsB6--pZv9TqnUQMhe9b39WDnRtjkho4M.woff2": "33d51712e3441720f7a52c2ce6e2c0f9",
"fallback-fonts/notosansgeorgian/v44/PlIaFke5O6RzLfvNNVSitxkr76PRHBC4Ytyq-Gof7PUs4S7zWn-8YDB09HFNdpvnzFj7f5WK0OQV.woff2": "5d3677d6a3a207e90c5b599b50477009",
"fallback-fonts/notosansmedefaidrin/v23/WwkzxOq6Dk-wranENynkfeVsNbRZtbOIdLb1exeM4ZeuabBfmErWlTj18e5A3rw.woff2": "aa72950bf55820bea3b35995e44dda18",
"fallback-fonts/notosanssorasompeng/v24/PlIRFkO5O6RzLfvNNVSioxM2_OTrEhPyDLolKvCsHzCxWuGkYHR818DsZXJQd4Mu.woff2": "0fed6663e52f8952973700fa88faab27",
"fallback-fonts/notosansgujarati/v25/wlpWgx_HC1ti5ViekvcxnhMlCVo3f5pv17ivlzsUB14gg1TMR2Gw4VceEl7MA_ypFwPJ_OdiEH0s.woff2": "fabff2281c1ef2148c4f9b1f13ac6ce9",
"fallback-fonts/notosanstagalog/v22/J7aFnoNzCnFcV9ZI-sUYuvote1R0wwEFA8jHexnL.woff2": "cc941d7e021c2ff9dab8f1b41248819c",
"fallback-fonts/notosanssymbols2/v24/I_uyMoGduATTei9eI8daxVHDyfisHr71-vrgfE71.woff2": "9b7821f83532d5da8592c011521a89f5",
"fallback-fonts/notosanssymbols2/v24/I_uyMoGduATTei9eI8daxVHDyfisHr71-jrBWXPM4Q.woff2": "ebc00b8df8e5958949f13ee35b8e66e9",
"fallback-fonts/notosanssymbols2/v24/I_uyMoGduATTei9eI8daxVHDyfisHr71-prgfE71.woff2": "13c29a515796c3e10ae840385b48e32e",
"fallback-fonts/notosanssymbols2/v24/I_uyMoGduATTei9eI8daxVHDyfisHr71-gTBWXPM4Q.woff2": "6ad6c9a441049aadfd33e0d452baccc6",
"fallback-fonts/notosanssymbols2/v24/I_uyMoGduATTei9eI8daxVHDyfisHr71-pTgfA.woff2": "12f5bd5c5878655bc040361079d6f6ac",
"fallback-fonts/notosanssymbols2/v24/I_uyMoGduATTei9eI8daxVHDyfisHr71-ujgfE71.woff2": "edc66658d5105b4099833dc8873c1659",
"fallback-fonts/notosanstelugu/v26/0FlxVOGZlE2Rrtr-HmgkMWJNjJ5_RyT8o8c7fHkeg-esVC5dzHkHIJQqrEntezbqREbf-3v37w.woff2": "f787692e3f4ca010797c5b86af61bf50",
"fallback-fonts/notosanstaile/v17/vEFK2-VODB8RrNDvZSUmVxEATwR58te1W77HtMo.woff2": "d11a132205bda4e463b13a7ba8e925fb",
"fallback-fonts/notosanshk/v32/nKKF-GM_FYFRJvXzVXaAPe97P1KHynJFP716qHB-yoaZiLjN.woff2": "57531097777b66139b746788544ebc30",
"fallback-fonts/notosanshk/v32/nKKF-GM_FYFRJvXzVXaAPe97P1KHynJFP716qHB-yo2ZiLjN.woff2": "b36dd6e93ec59c09c994d3f62afdfe80",
"fallback-fonts/notosanshk/v32/nKKF-GM_FYFRJvXzVXaAPe97P1KHynJFP716qHB-yoKZiA.woff2": "9649696186074883d8191b6aa73a3718",
"fallback-fonts/notosanshk/v32/nKKF-GM_FYFRJvXzVXaAPe97P1KHynJFP716qHB-yoyZiLjN.woff2": "035fd108d2ec39e5070fcf91cc8f53ef",
"fallback-fonts/notosanscherokee/v20/KFOPCm6Yu8uF-29fiz9vQF9YWK6Z8O10cHNA0cSkZCHYWi5PDky5rAffjl0.woff2": "c53d75527d47b2e9897ac5c43094ba0b",
"fallback-fonts/notosansmasaramgondi/v17/6xK_dThFKcWIu4bpRBjRYRV7KZCbUq6n_1kPnuGb7RI9WSWX.woff2": "2eb6b249da40a3a764f516ea785e166d",
"fallback-fonts/notosansethiopic/v47/7cHPv50vjIepfJVOZZgcpQ5B9FBTH9KGNfhSTgtoow1KVnIvyBoMSzUMacb-T35OK6DmwmfeaY9u.woff2": "6c1b77aea8f893e3337f811e5d9ec9d9",
"fallback-fonts/notosanskaithi/v22/buEtppS9f8_vkXadMBJJu0tWjLwjQigKdoZIKlo.woff2": "14b2efbaed19e919393ff3c47045e68b",
"fallback-fonts/notosansmalayalam/v26/sJoi3K5XjsSdcnzn071rL37lpAOsUThnDZIfPdbeSNzVakglNM-Qw8EaeB8Nss-_RuD9AVzEr6HxEA.woff2": "c7451817d26b88c4095829dbd4fd1365",
"fallback-fonts/notosanssaurashtra/v23/ea8GacQ0Wfz_XKWXe6OtoA8w8zvmYwTef9nYjhPTSIx9.woff2": "915c012a528db2912496ddfdeeff3590",
"fallback-fonts/notosansolchiki/v29/N0b92TJNOPt-eHmFZCdQbrL32r-4CvhzDzRwlxOQYuVALWk267c6gVrz5gQ.woff2": "d2da3a1fe911f550a7e6d99e319bd721",
"fallback-fonts/notosanskhudawadi/v22/fdNi9t6ZsWBZ2k5ltHN73zZ5hc8HANlHIjFnVVXz9MY.woff2": "ce6759719a07c72a976da534caae9af7",
"fallback-fonts/notosansoldturkic/v18/yMJNMJVya43H0SUF_WmcGEQVqoEMKDKbsE2UjEw-Vyws.woff2": "3da2705060931bcc6aaae760bb57ce41",
"fallback-fonts/notosanssharada/v16/gok0H7rwAEdtF9N8-mdTGALG6p0kwoXOPOwr4H8a.woff2": "e1d26b3ee938723d94fd04087c2023ab",
"fallback-fonts/notosanssymbols/v43/rP2up3q65FkAtHfwd-eIS2brbDN6gxP34F9jRRCe4W3gfQ8gb_VFRkzrbQ.woff2": "c6a8512ca64752f75550e37c898e3560",
"fallback-fonts/notosansbalinese/v24/NaPwcYvSBuhTirw6IaFn6UrRDaqje-lpbbRtYf-Fwu2Ov7fdhEtVd222PPY.woff2": "fdd61ab860a42785f6ee0c189f202cc6",
"fallback-fonts/notosanssiddham/v20/OZpZg-FwqiNLe9PELUikxTWDoCCeGqnYk3Ic92ZH.woff2": "69703771e4bb19f4644f09aeb3369f1c",
"fallback-fonts/notosansavestan/v21/bWti7ejKfBziStx7lIzKOLQZKhIJkyu4SASLji8U.woff2": "8017140cb9785717d783fd5fce1b31d1",
"fallback-fonts/notosanschakma/v17/Y4GQYbJ8VTEp4t3MKJSMjg5OIzhi4J3TQhYBeYo.woff2": "4774c3aaa9c4f3fc8c3881e19a536709",
"fallback-fonts/notosanskannada/v27/8vIs7xs32H97qzQKnzfeXycxXZyUmySvZWItmf1fe6TVmgop9ndpS-BqHEyGrDvNzScMLsPKrkY.woff2": "2d3ef7f103a608624a60975d81d1b9c2",
"fallback-fonts/notosanssogdian/v16/taiQGn5iC4--qtsfi4Jp6eHPnfxQBo-7Pm6KHidM.woff2": "92340d846e9d503ab564a24067e5c48a",
"fallback-fonts/notosansshavian/v17/CHy5V_HZE0jxJBQlqAeCKjJvQBNF4EFVSplv2Cwg.woff2": "10287496c6751e98edfa192667cf5886",
"fallback-fonts/notosansugaritic/v16/3qTwoiqhnSyU8TNFIdhZVCwbjCpkAXXkNxoIkiazfg.woff2": "453f4dd0ddf1273d58a54c648f9515cf",
"fallback-fonts/notosansinscriptionalparthian/v17/k3k7o-IMPvpLmixcA63oYi-yStDkgXuXncL7dzfW3P4TAJ2yklBM2jNkLlLr.woff2": "58bc0a2e3c96fc5f681dcebb1df7e635",
"fallback-fonts/notosansoldnortharabian/v16/esDF30BdNv-KYGGJpKGk2tNiMt7Jar6olZDyNdr81zBQnEo_xw4ABw.woff2": "42cd636b0af55262d304229b802f2f7e",
"fallback-fonts/notosanslycian/v15/QldVNSNMqAsHtsJ7UmqxBQA9r8wA5_zaCJwn00E.woff2": "883bf0a75182fc79d2b0966dec8c6bfb",
"fallback-fonts/notosansimperialaramaic/v17/a8IMNpjwKmHXpgXbMIsbTc_kvks91LlLetBr5itQrtdjl3YfPNno.woff2": "364635ac5aab271fdec0a76a15da99d8",
"fallback-fonts/notosanscoptic/v21/iJWfBWmUZi_OHPqn4wq6kgqumOEd786_VG0xR4Y.woff2": "5f07e2bd1ab1a727606566d36dd816c0",
"fallback-fonts/notosansoldhungarian/v18/E213_cD6hP3GwCJPEUssHEM0KqLaHJXg2PiIgRfmbg5nCYXt.woff2": "6401f9f7d055cf1a1abec1a0d84ab573",
"fallback-fonts/notosansphoenician/v17/jizFRF9Ksm4Bt9PvcTaEkIHiTVtxmFtS5X7Mot-p5561.woff2": "67796da37c8f3023151134c109bd5f32",
"fallback-fonts/notosansnushu/v19/rnCw-xRQ3B7652emAbAe_Ai1IYaFXVAMArZKqQ.woff2": "15d081042088ff44f7dae97ab21ab9a6",
"fallback-fonts/notosanssundanese/v26/FwZw7_84xUkosG2xJo2gm7nFwSLQkdymq2mkz3Gz1_b6ctxpNNHHizv7fQES.woff2": "75010e03a185b10923ae31f4e72da159",
"fallback-fonts/notosansoldpermic/v17/snf1s1q1-dF8pli1TesqcbUY4Mr-ElrwKLdSgv_dKYB5.woff2": "bcc8bf557b1c30bb7285c8cf3aae3bef",
"fallback-fonts/notosanspaucinhau/v20/x3d-cl3IZKmUqiMg_9wBLLtzl22EayN7ehIdiUWqKMxsKw.woff2": "ba92907223a568288b4b2057d4d83333",
"fallback-fonts/notosanssc/v37/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FrYtHbQ.woff2": "b986164dfde07516f0b8c2530bca7339",
"fallback-fonts/notosanssc/v37/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FrYRHbczS.woff2": "84c481a06d6b7391b0a44040daa122ba",
"fallback-fonts/notosanssc/v37/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FrY9HbczS.woff2": "1a887e296015ead90bfc7f8c3badd49b",
"fallback-fonts/notosanssc/v37/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FrYVHbczS.woff2": "ea3a22a61a503365fbf5ea453aa2132a",
"fallback-fonts/notosanswarangciti/v17/EYqtmb9SzL1YtsZSScyKDXIeOv3w-zgsNvKRoOVCCXzdgA.woff2": "25e335a6c0da02dbd2aa7f1bc127a4de",
"fallback-fonts/notosansrejang/v21/Ktk2AKuMeZjqPnXgyqrib7DIogqwN4a3WYZB_sU.woff2": "92b5b8cf1b4c4d8a8e04ec987cb8b429",
"fallback-fonts/notosanszanabazarsquare/v19/Cn-jJsuGWQxOjaGwMQ6fOicyxLBEMRfDtkzl4uagQtJ0OCEgN0Gc.woff2": "e4d5b6ed495da47958673c19858b96fc",
"fallback-fonts/notosansvai/v17/NaPecZTSBuhTirw6IaFn_UrURMHsDIRSfr0.woff2": "82d84105d91a54921a72d32a5c68c921",
"fallback-fonts/notosanselbasan/v16/-F6rfiZqLzI2JPCgQBnw400qp1trvHdgre4dFcFh.woff2": "81fe6ff268116cdf924b08de4075d808",
"fallback-fonts/notosanslydian/v18/c4m71mVzGN7s8FmIukZJ1v4ZlcPReUbXMoIjEQI.woff2": "4c4e1cfeca93699bd3a501f0e5dcc75e",
"fallback-fonts/notosansmarchen/v20/aFTO7OZ_Y282EP-WyG6QTOX_C8WZMHhKk652ZaHk.woff2": "a7463c88945f0249b777c89e466f5676",
"fallback-fonts/notosanshebrew/v46/or3HQ7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaeNKYZC0sqk3xXGiXd4qtpyJltutR2g.woff2": "efcd2c9404cdc23e5b1f6931ba5df6a8",
"fallback-fonts/notosansosage/v18/oPWX_kB6kP4jCuhpgEGmw4mtAVtXQ1aSxkrMCQ.woff2": "f0884aa4863756a1807e606c345edcd0",
"fallback-fonts/notosansmyanmar/v20/AlZq_y1ZtY3ymOryg38hOCSdOnFq0Enz3OU4o1AC.woff2": "bcd06ca882367bd5c0d5e0254ac8ac58",
"fallback-fonts/notosansbamum/v27/uk-0EGK3o6EruUbnwovcbBTkkklK_Ya_PBHfNGTPEddO-_0LykxEkxA.woff2": "53cd52106f98b59343828de0d3c67b24",
"fallback-fonts/notosanssinhala/v32/yMJ2MJBya43H0SUF_WmcBEEf4rQVO2P524V5N_MxQzQtb-tf5dJbC30Fu9zUwg2a5l0LpJwbQRM.woff2": "6b4087de474da4096b6428fac606bcc8",
"fallback-fonts/notosanspsalterpahlavi/v17/rP2Vp3K65FkAtHfwd-eISGznYihzggmsicPfud3w1GjKsUQBct4.woff2": "06ea38b23b58016821b945da7a2ff497",
"fallback-fonts/notosansbuhid/v22/Dxxy8jiXMW75w3OmoDXVWJD7YwzAfqtgnaFoGA.woff2": "04d114a8d5678fd15bc4a82d0f017644",
"fallback-fonts/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj35LS04w-.woff2": "dfdc42e3b9eb1d204dd668b875f9b2d2",
"fallback-fonts/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj35PS04w-.woff2": "4e643dd533eb548e8d395309dfac11cc",
"fallback-fonts/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj35jS04w-.woff2": "d861e023cca2fa58009ada07a1a4bbb8",
"fallback-fonts/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj35zS0w.woff2": "7c7a44b5bf97b03c6a7205248279c544",
"fallback-fonts/notosansduployan/v18/gokzH7nwAEdtF9N8-mdTDx_X9JM5wsvbi-kD5F8a.woff2": "cb11d51dfe46633ced220e85d6981718",
"fallback-fonts/notosansduployan/v18/gokzH7nwAEdtF9N8-mdTDx_X9JM5wsvbEcgm.woff2": "6b3a44a53c0db1d20344258b4fe483f2",
"fallback-fonts/notosansduployan/v18/gokzH7nwAEdtF9N8-mdTDx_X9JM5wsvbH8gm2WY.woff2": "50e689d5391835e3134ab484af71c12b",
"fallback-fonts/notosanslineara/v18/oPWS_l16kP4jCuhpgEGmwJOiA18FZj22y2HQAGQicw.woff2": "c7527ed1c9ab67bdaeac3a45e5e9efeb",
"fallback-fonts/notosanstagbanwa/v18/Y4GWYbB8VTEp4t3MKJSMmQdIKjRtt_nZQzQEaYpGoQ.woff2": "92c47066afec0944811e539b7940a657",
"fallback-fonts/notosansnewtailue/v22/H4cKBW-Pl9DZ0Xe_nHUapt7PovLXAhAnY7wqaLy-OJgU3p_pdeXAYUPghFPKzeY.woff2": "f2a2018cfa41c375776a73b269984dd2",
"fallback-fonts/notosansbuginese/v18/esDM30ldNv-KYGGJpKGk18phe_7Da6_gsPuEXLmNtw.woff2": "8b374eb965439cc42eff2ca4616ace60",
"fallback-fonts/notosansmultani/v20/9Bty3ClF38_RfOpe1gCaZ8p30BOFO1AxpfCs5Kos.woff2": "1024149bfa316e14a02285562e97bf48",
"fallback-fonts/notosanstirhuta/v16/t5t6IQYRNJ6TWjahPR6X-M-apUyby7uDUBsTrn5P.woff2": "1db7a090f2e039a07951a8bfb318199b",
"fallback-fonts/notosanskayahli/v21/B50nF61OpWTRcGrhOVJJwOMXdca6Yecki3E06x2jVTX3WCc3CZT4EXLuKVM.woff2": "b62bce0514bcae7b1f5d944d2267162b",
"fallback-fonts/notosanskhmer/v24/ijw3s5roRME5LLRxjsRb-gssOenAyendxrgV2c-Zw-9vbVUti_Z_dWgtWYuNAJz9kAbrddiA.woff2": "c0d39f43a7ef1ceb909a9b3bb773c61c",
"fallback-fonts/notoseriftibetan/v22/gokGH7nwAEdtF9N45n0Vaz7O-pk0wsvxHeDXMfqguoCmIrYcPSvrdSy_32c.woff2": "d8d710f79cd500484bdf473b7e3dc792",
"fallback-fonts/notosansthaana/v24/C8c14dM-vnz-s-3jaEsxlxHkBH-WZOETXfoQrfQ9Y4XrbhLknu4-tbNu.woff2": "f0f0b66583d5b6154cdf2a6c6c2e9b8f",
"fallback-fonts/notosanssylotinagri/v23/uU9eCAQZ75uhfF9UoWDRiY3q7Sf_VFV3m4dGFVLxN87gsj0.woff2": "652036cf6d93c4076e108afbe123923f",
"fallback-fonts/notosansnko/v6/esDX31ZdNv-KYGGJpKGk2_RpMpWMHMLBrdA.woff2": "77006d92680df12fa57319d9a58dc607",
"fallback-fonts/notosansoldpersian/v16/wEOjEAbNnc5caQTFG18FHrZr9Bp6-8CmIJ_trelQfx9CjA.woff2": "92ee472ef0a15041bb42cf80016335fd",
"fallback-fonts/notosansinscriptionalpahlavi/v17/ll8UK3GaVDuxR-TEqFPIbsR79Xxz9WEKbwsjpz7VklYlC7FCVt-VOAYK0QA.woff2": "7c3bc6104755695ef4a91a20936cecee",
"fallback-fonts/notosansegyptianhieroglyphs/v29/vEF42-tODB8RrNDvZSUmRhcQHzx1s7y_F9-j3qSzEcbEYintQFi99Rg.woff2": "cb2beb9b4326b05b36421f7707e6e5e9",
"fallback-fonts/notosansegyptianhieroglyphs/v29/vEF42-tODB8RrNDvZSUmRhcQHzx1s7y_F9-j3qSzEcbEYintdVi99Rg.woff2": "e55d23c6b4a83c9f8ac4247aeb146dba",
"fallback-fonts/notosansegyptianhieroglyphs/v29/vEF42-tODB8RrNDvZSUmRhcQHzx1s7y_F9-j3qSzEcbEYintTli9.woff2": "f69fb8e2d1efe43f4e0c3f86ceb0d263",
"fallback-fonts/notosansdevanagari/v26/TuGoUUFzXI5FBtUq5a8bjKYTZjtRU6Sgv3NaV_SNmI0b8QQCQmHn6B2OHjbL_08AlXQly-UzoFoW4Ow.woff2": "176a856f328af9987e95de915044bb6e",
"fallback-fonts/notosansmahajani/v19/-F6sfiVqLzI2JPCgQBnw60Agp0JrvD5FgsARHNh4zg.woff2": "919734bf36e86e7c871f3c99e6481ea6",
"fallback-fonts/notosanselymaic/v17/UqyKK9YTJW5liNMhTMqe9vUFP65ZD4AmWOT0zi2V.woff2": "8c415cf1fee1d66327a6d010b925cff1",
"fallback-fonts/README.txt": "07897d310cf4802acdb99a54da5b1c8d",
"fallback-fonts/notosansgrantha/v19/3y976akwcCjmsU8NDyrKo3IQfQ4o-r8ZFeulHc6N.woff2": "05b987292df24eba4b370ef1931196a0",
"fallback-fonts/notosans/v37/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A99Y41P6zHtY.woff2": "b146e700a8920bdd55c16242d51d69d9",
"fallback-fonts/notosansogham/v17/kmKlZqk1GBDGN0mY6k5lmEmww4hrsplaQxcoCA.woff2": "62c803f84d428b4b4a67ec65f901fd56",
"fallback-fonts/roboto/v32/KFOmCnqEu92Fr1Me4GZLCzYlKw.woff2": "e507bd45228483ae2f864d36f26bb43e",
"fallback-fonts/notosanspalmyrene/v16/ZgNPjOdKPa7CHqq0h37c_ASCWvH93SFCPne5ZpdNtcA.woff2": "fa9fb296153d2015788e3bbbbf9f549b",
"fallback-fonts/notosanscaucasianalbanian/v18/nKKA-HM_FYFRJvXzVXaANsU0VzsAc46QGOkWytlTs-TXrYXmoVmRSZo.woff2": "17ab3fb9047b5ad2865f8ef15f660f9f",
"fallback-fonts/notosansoldsogdian/v17/3JnjSCH90Gmq2mrzckOBBhFhdrMst48aURt7mOIqM-9uyg.woff2": "b40aa4742bfd5ffc8a706578ba3eb34b",
"fallback-fonts/notosanspahawhhmong/v18/bWtp7e_KfBziStx7lIzKKaMUOBEA3UPQDW7krzI_c48aMpM.woff2": "1eae06f9c266a7b10690b863dcd65073",
"fallback-fonts/notosanssoyombo/v17/RWmSoL-Y6-8q5LTtXs6MF6q7xsxgY0FuIFOcK25W.woff2": "08687e9049b7c1380313ab9a0a0113b3",
"fallback-fonts/notosanslimbu/v24/3JnlSDv90Gmq2mrzckOBBRRoNJVj1cF3OHRDnA.woff2": "6c7aac98e8732acf1e4fc3dd3a4cb047",
"fallback-fonts/notosansmongolian/v22/VdGCAYADGIwE0EopZx8xQfHlgEAMsrToxL4g6-av1x0.woff2": "ce368f77e3ccd8f6161ba6b107f8f925",
"fallback-fonts/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoySL3g8U4h.woff2": "b77d5dc680763119024433e2574c6821",
"fallback-fonts/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoySLPg8Q.woff2": "6206120ac2c0a18098ad7ff8888d3568",
"fallback-fonts/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoySLzg8U4h.woff2": "0159dc51e4c19a0f139c3b702d181205",
"fallback-fonts/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoySLfg8U4h.woff2": "747dc90a264c4589e1a6b5890408eedf",
"fallback-fonts/notosansgothic/v16/TuGKUUVzXI5FBtUq5a8bj6wRbzxTFMD40kFQRx0.woff2": "a18036c1eadc95b677fc53cf1f3448c9",
"fallback-fonts/notosansnewa/v16/7r3fqXp6utEsO9pI4f8ok8sWg8n6qN4R5lNU.woff2": "8e23c7a0b8eff66c76605b789772fb8a",
"fallback-fonts/notomusic/v20/pe0rMIiSN5pO63htf1sxItKQB9Zra1U.woff2": "93b501896e07dab9b59f1d44f56094eb",
"fallback-fonts/notosansmayannumerals/v16/PlIuFk25O6RzLfvNNVSivR09_KqYMwvvDKYjfIiE7soo6eepYQ.woff2": "3801b6275864ce877fbdba97b1819656",
"fallback-fonts/notosansnabataean/v16/IFS4HfVJndhE3P4b5jnZ34DfsjO330dNoBd9hK8kMK4.woff2": "7faf7e27512b0a77b72f230b348c1aca",
"fallback-fonts/notosanstamil/v27/ieVc2YdFI3GCY6SyQy1KfStzYKZgzN1z4LKDbeZce-0429tBManUktuex7vGo70UqKDt_EvT.woff2": "ca936a31d96048f2ffff2b98c4e7cb7a",
"fallback-fonts/notosansadlam/v22/neIczCCpqp0s5pPusPamd81eMfjPonvqdbYxxpgufnv0TGzBZLwhuvk.woff2": "8459be39806bc747cba45d36d2f21211",
"fallback-fonts/notosanscarian/v16/LDIpaoiONgYwA9Yc6f0gUILeMIOgs78b9yGLmfI.woff2": "0118233a28f863a5ec9be9e53ebfc3c5",
"fallback-fonts/notosansbatak/v20/gok2H6TwAEdtF9N8-mdTCQvT-Zdgpo_PHuk74A.woff2": "d65f8c690068d4ab5cce435691dc9a87",
"fallback-fonts/notosanslepcha/v19/0QI7MWlB_JWgA166SKhu05TekNS32AdstqBXgd4.woff2": "5c1a4837a9e33cccb9b265bb40ac00ee",
"fallback-fonts/notosansglagolitic/v18/1q2ZY4-BBFBst88SU_tOj4J-4yuNF_HI4ERP4Amu7nM1.woff2": "5d076e62ed07711b4201a0e4ead0dfee",
"fallback-fonts/notosansgunjalagondi/v19/bWtX7e7KfBziStx7lIzKPrcSMwcEnCv6DW7n5g0ef3PLtymzNxYL4YDE5Z4vCTxEJQ.woff2": "fa9e7552145baac9f80e9bcaa22bea62",
"fallback-fonts/notosanstifinagh/v20/I_uzMoCduATTei9eI8dawkHIwvmhCvbn77nEcXfs4Q.woff2": "7ffe86917c9fd9dddd4e1f8a26aab982",
"fallback-fonts/notosansmanichaean/v18/taiVGntiC4--qtsfi4Jp9-_GkPZZCcrfekqHNTtFCtdX.woff2": "22c6b962d25604e258ff923e077614c7",
"fallback-fonts/notosanslisu/v25/uk-3EGO3o6EruUbnwovcYhz6kh57_nqbcTdjJnHP2Vwt3tIlxkVdig.woff2": "afb9e2c1628ab17d5a17d8a6b7e46a8f",
"fallback-fonts/notosanshanunoo/v21/f0Xs0fCv8dxkDWlZSoXOj6CphMloFsEpEpgL_ix2.woff2": "de4af3ec5185b7c442d37058f50c8a3d",
"fallback-fonts/notosansoldsoutharabian/v16/3qT5oiOhnSyU8TNFIdhZTice3hB_HWKsEnF--0XCHiKx0etDT9HwTA.woff2": "5b4103e318392c7432b00e0c0f67f585",
"fallback-fonts/notosansbassavah/v17/PN_bRee-r3f7LnqsD5sax12gjZn7mBpL5YwUpA2MBdcFn4MaAc6s34gH-GD7.woff2": "6c41f3ddbd6f337bf89de5a5afd739a8",
"fallback-fonts/notosansmeeteimayek/v15/HTxAL3QyKieByqY9eZPFweO0be7M21uSphSdhqILnmrRfJ8t_1TJ_vTT5PgeFYVa.woff2": "573b9bea9218280508749443bd9b5824",
"fallback-fonts/notosansmeroitic/v18/IFS5HfRJndhE3P4b5jnZ3ITPvC6i00UDhThTiKY9KQ.woff2": "ce51beefe9c2313de5587616dac8fc01",
"fallback-fonts/notosansmiao/v17/Dxxz8jmXMW75w3OmoDXVV4zyZUjlUYVslLhx.woff2": "0436111b25d1ddfc0c2471e78a127247",
"fallback-fonts/notosansmodi/v23/pe03MIySN5pO62Z5YkFyT7jeav5vWVAgVol-.woff2": "3b6e5b119f3fd63eded918f0167127e5",
"fallback-fonts/notosansarabic/v28/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvvnCBFQLaig.woff2": "5518b50bff43f96fd44010453e3a0ef6",
"fallback-fonts/notosansarmenian/v43/ZgN0jOZKPa7CHqq0h37c7ReDUubm2SEdFXp7ig73qtTY5idb74R9UdM3y2nZLorxb60nYy6zF3Eg.woff2": "9b68cbbe6d9b68d59d7fa3a556c67f63",
"fallback-fonts/notosansmandaic/v17/cIfnMbdWt1w_HgCcilqhKQBo_OsMI5_F_gMk0izH.woff2": "f3ee65b37b392b655f9cf30fd3837240",
"fallback-fonts/notosansindicsiyaqnumbers/v16/6xK5dTJFKcWIu4bpRBjRZRpsIYHabOeZ8UZLubTzpXNHKx2TPOpVd5Iu.woff2": "8d44c7181fe0858ce46c08d00b941bda",
"fallback-fonts/notosansdeseret/v17/MwQsbgPp1eKH6QsAVuFb9AZM6MMr2Vq4ZnJSZtQG.woff2": "5eab77ee811ac158db923fffe59cde0a",
"fallback-fonts/notosanswancho/v17/zrf-0GXXyfn6Fs0lH9P4cUubP0GBqAbopiRfKp8.woff2": "343e90391cb9c907bb92c4e150dad867",
"fallback-fonts/notosanstakri/v24/TuGJUVpzXI5FBtUq5a8bnKIOdTwQMe_W3khJXg.woff2": "1fe95e4f0909967f4cae81d197011269",
"fallback-fonts/notosanscham/v31/pe06MIySN5pO62Z5YkFyQb_bbuRhe6D4yip43qfcERwcurGykboaLg.woff2": "59d91a9aec780972836f4cd4824b5fc6",
"fallback-fonts/notosanskhojki/v19/-nFnOHM29Oofr2wohFbTuPPKVWpmK_J709jy92k.woff2": "46c63f720413ca7d18c89cf55537c4a7",
"fallback-fonts/notosanstaitham/v20/kJEbBv0U4hgtwxDUw2x9q7tbjLIfbPGHBoaVSAZ3MdLJBCUbPg-uyaRGKMw.woff2": "1273cb0b9100850405ab2cf169385240",
"fallback-fonts/notosansolditalic/v17/TuGOUUFzXI5FBtUq5a8bh68BJxxEVam7tWlUdRhtCC4d.woff2": "75344da0b07b4d92659daa8dbd23ea8e",
"fallback-fonts/notosansbrahmi/v19/vEFK2-VODB8RrNDvZSUmQQIIByV18te1W77HtMo.woff2": "22104db78a420588806f73b2b13feba8",
"fallback-fonts/notosansyi/v19/sJoD3LFXjsSdcnzn071rO3apwFDJNVgSNg.woff2": "d03e39ae1a0d7368a6a2d7ab727cd9e9",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"manifest.json": "811899677043aa50cec55842ffcc2667",
"assets/AssetManifest.json": "b02e0c21a469a8d7699de0e5d8786a3c",
"assets/NOTICES": "8b4ea2c455088f79225a32a654209a8d",
"assets/FontManifest.json": "68f00fdd93df0ce89ed7865f3934101e",
"assets/AssetManifest.bin.json": "2bdc8cbfb0c404155dfdac2ad2b868a4",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "825e75415ebd366b740bb49659d7a5c6",
"assets/packages/commmerce_ui/fonts/Poppins-Medium.ttf": "20aaac2ef92cddeb0f12e67a443b0b9f",
"assets/packages/commmerce_ui/fonts/Poppins-Regular.ttf": "09acac7457bdcf80af5cc3d1116208c5",
"assets/packages/commmerce_ui/fonts/DancingScript-Regular.ttf": "e85a38747622881a0040dcf17dd87f77",
"assets/packages/commmerce_ui/fonts/Poppins-SemiBold.ttf": "2c63e05091c7d89f6149c274971c7c23",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin": "48c5d8e15c3364ee3161491abec1cd30",
"assets/fonts/MaterialIcons-Regular.otf": "c0ad29d56cfe3890223c02da3c6e0448",
"assets/assets/logo-placeholder-black.png": "676cf5c985bd61254b19681102cbde6c",
"assets/assets/logo-placeholder-white.png": "db002c46661a4ccc8895d2e2aaa8da1c",
"canvaskit/skwasm.js": "ea559890a088fe28b4ddf70e17e60052",
"canvaskit/skwasm.js.symbols": "9fe690d47b904d72c7d020bd303adf16",
"canvaskit/canvaskit.js.symbols": "27361387bc24144b46a745f1afe92b50",
"canvaskit/skwasm.wasm": "1c93738510f202d9ff44d36a4760126b",
"canvaskit/chromium/canvaskit.js.symbols": "f7c5e5502d577306fb6d530b1864ff86",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.wasm": "c054c2c892172308ca5a0bd1d7a7754b",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.wasm": "a37f2b0af4995714de856e21e882325c"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
