$table.parse("BL14I-PS-alarms.csv")
#set($dom = "BL14I")
#set($nSerial = 5)
#set($nParIlk = 0)
#set($nParLop = -1)
#set($splitRowId = 8)
#set($title = "PSS - BL14I: ALARMS")
#parse("pss_include.v")
