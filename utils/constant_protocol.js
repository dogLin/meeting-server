const constant = {
    device_host_model: 'm3',
    device_speakUnit_model: 'speakunit',
    device_powerctrl_model: 'PT-9615C',
    device_protocol_structure: {
        header: {
            value: '.Cvi',
            offset: 0,
            length: 4
        },
        destDevice: {
            offset: 4,
            length: 2
        },
        srcAddr: {
            offset: 6,
            length: 2
        },
        sendTime: {
            offset: 8,
            length: 4
        },
        priority: {
            offset: 12,
            length: 2
        },
        command: {
            offset: 14,
            length: 2
        },
        dataLength: {
            offset: 16,
            length: 2
        },
        data: {
            offset: 18,
        },
        end: {
            value: 'end.',
            length: 4
        }
    },
    host_heart_structure: {
        mac: {
            length: 6,
            offset: 0
        },
        ip: {
            length: 4,
            offset: 6
        },
        devno: {
            length: 2,
            offset: 10
        },
        status: {
            length: 2,
            offset: 12
        },
        wareversion: {
            length: 4,
            offset: 14
        },
        mastercpu: {
            value: 0x4d,
            length: 1,
            offset: 18
        }
    },
    speakunit_heart_structure: {
        mac: {
            length: 6,
            offset: 0
        },
        ip: {
            length: 4,
            offset: 6
        },
        devno: {
            length: 2,
            offset: 10
        },
        status: {
            length: 2,
            offset: 12
        },
        wareversion: {
            length: 4,
            offset: 14
        }
    },
    server_heart_structure: {
        date: {
            length: 8,
            offset: 0,
            format: 'YYYYMMDDHHmmssd',
            codedFormat: 'hex'
        }
    },
    device_downmember_structure: {
        username: {
            length: 8,
            offset: 0,
            codedFormat: 'gbk'
        },
        mac: {
            length: 6,
            offset: 8,
            codedFormat: 'hex'
        },
        sex: {
            length: 1,
            offset: 14,
            codedFormat: 'hex'
        },
        professor: {
            length: 10,
            offset: 15,
            codedFormat: 'gbk'
        }
    },
    device_burn_structure: {
        mac: {
            length: 6,
            offset: 0,
            codedFormat: 'hex'
        },
        devno: {
            length: 2,
            offset: 6,
        }
    },
    device_vote_structure: {
        mac: {
            length: 6,
            offset: 0,
            codedFormat: 'hex'
        },
        option: {
            length: 1,
            offset: 6,
        }
    },
    device_net_structure: {
        mac: {
            length: 6,
            offset: 0,
            codedFormat: 'hex'
        },
        ip: {
            length: 4,
            offset: 10,
        },
        netmask: {
            length: 4,
            offset: 14,
        },
        gateway: {
            length: 4,
            offset: 18,
        },
        dns: {
            length: 4,
            offset: 22,
        },
    },
    device_mac_structure: {
        mac: {
            length: 6,
            offset: 0,
            codedFormat: 'hex'
        }
    },
    device_speakmodel_structure: {
        model: {
            length: 1,
            offset: 0,
            codedFormat: 'hex'
        }
    },
    device_volume_structure: {
        volume: {
            length: 1,
            offset: 0
        }
    },
    device_protocol_fixedlength: 22,
    device_protocol_header: '.Cvi',
    device_protocol_end: 'end.',
    device_all_destaddr: 0xFFFF,
    device_m3_destaddr: 0x4801,
    device_m3_command_downmember: 0x6800,
    device_m3_command_delmember: 0x6801,
    device_m3_command_delallmember: 0x6802,
    device_m3_command_appointrostrum: 0x6803,
    device_m3_command_dismissrostrum: 0x6804,
    device_speakUnit_command_prohibit: 0x6805,
    device_speakUnit_command_permit: 0x6806,
    device_speakUnit_command_allprohibit: 0x6807,
    device_speakUnit_command_allpermit: 0x6808,
    device_speakUnit_command_switchmodel: 0x6809,
    device_m3_command_openchannel: 0x680a,
    device_m3_command_closechannel: 0x680b,
    device_speakUnit_command_volume: 0x680c,
    device_m3_command_volume: 0x680d,
    device_command_vote: 0x680e,
    device_command_disvote: 0x680f,
    device_command_sign: 0x6810,
    device_command_unsign: 0x6811,
    device_command_usersign: 0x6812,
    device_command_uservote: 0x6813,
    device_heart_askport: 0x7100,
    device_heart_sign: 0x710a,
    device_heart_vote: 0x710b,
    device_heart_quiet: 0x7104,
    device_heart_speak: 0x7105,
    device_command_burn: 0x7701,
    device_command_net: 0x7702,
    device_speakUnit_destaddr: 0x5101,
    device_default_srcaddr: 0x0000,
    server_heart_command: 0x0001,
    device_heart_command: 0x0002,
}

module.exports = constant